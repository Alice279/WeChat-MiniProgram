package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"

	"github.com/alicebob/miniredis/v2"
	"github.com/go-redis/redis/v8"
	"github.com/heymind/puki/file"
	activitySetup "github.com/heymind/puki/pkg/activity/setup"
	"github.com/heymind/puki/pkg/auth"
	authSetup "github.com/heymind/puki/pkg/auth/setup"
	"github.com/heymind/puki/pkg/base/rpc"
	fieldSetup "github.com/heymind/puki/pkg/field/setup"
	home_swiper "github.com/heymind/puki/pkg/home_swiper/setup"
	intrSetup "github.com/heymind/puki/pkg/introduction/setup"
	joinSetup "github.com/heymind/puki/pkg/join/setup"
	pointsSetup "github.com/heymind/puki/pkg/points/setup"
	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var buildTag = "dev"
var buildCommit = "UNSET"
var filePath string

func main() {

	var err error
	address := flag.String("address", ":8001", "The address server listens on")
	redisAddr := flag.String("redis", "", "The redis server address")
	flag.Parse()
	switch flag.Arg(0) {

	case "version":
		fmt.Printf("%s_%s", buildTag, buildCommit)
		return

	}

	err = godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	log.SetLevel(log.TraceLevel)

	if *redisAddr == "" {
		mrds, err := miniredis.Run()
		if err != nil {
			panic(err)
		}
		defer mrds.Close()
		*redisAddr = mrds.Addr()
	}

	rds := redis.NewClient(&redis.Options{Addr: *redisAddr})

	var db *gorm.DB
	pgUrl := os.Getenv("PG_URL")
	if pgUrl != "" {
		db, err = gorm.Open(postgres.Open(pgUrl), &gorm.Config{})
		log.Info("using pg")
	} else {
		db, err = gorm.Open(sqlite.Open("dev.db"), &gorm.Config{})
		log.Info("using sqlite")
	}

	filePath = os.Getenv("FILE_PATH")
	if filePath == "" {
		filePath = "./static/"
	}
	file.Init(filePath)

	reg := rpc.NewServiceRegistry("api")

	sessionManager := auth.NewSessionManager(rds, "SESSION")
	if err := authSetup.Setup(reg, db, sessionManager); err != nil {
		log.Fatal(err)
	}
	if err := activitySetup.Setup(reg, db, sessionManager); err != nil {
		log.Fatal(err)
	}
	if err := intrSetup.Setup(reg, db, sessionManager); err != nil {
		log.Fatal(err)
	}
	if err := fieldSetup.Setup(reg, db, sessionManager); err != nil {
		log.Fatal(err)
	}

	if err := joinSetup.Setup(reg, db, sessionManager); err != nil {
		log.Fatal(err)
	}

	if err := home_swiper.Setup(reg, db); err != nil {
		log.Fatal(err)
	}

	if err := pointsSetup.Setup(reg, db, sessionManager); err != nil {
		log.Fatal(err)
	}

	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/api/", reg)
	http.HandleFunc("/api/upload", file.Upload)
	fs := http.FileServer(http.Dir(filePath))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Infof("server listen @ %s", *address)
	log.Fatal(http.ListenAndServe(*address, nil))
}
