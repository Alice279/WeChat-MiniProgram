package testutil

import (
	"flag"
	"fmt"
	"github.com/alicebob/miniredis/v2"
	"github.com/go-redis/redis/v8"
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"os"
	"testing"
)

type Services struct {
	Db  *gorm.DB
	Rds *redis.Client
	Sm  *auth.SessionManager
	Reg *rpc.ServiceRegistry
}

var (
	cwd_arg = flag.String("cwd", "", "set cwd")
)

func Setup(t *testing.T) *Services {
	flag.Parse()
	if *cwd_arg != "" {
		if err := os.Chdir(*cwd_arg); err != nil {
			fmt.Println("Chdir error:", err)
		}
	}
	err := godotenv.Load()
	if err != nil {
		t.Fatal(err)
	}
	log.SetLevel(log.TraceLevel)
	mrds, err := miniredis.Run()
	if err != nil {
		log.Fatal(err)
	}
	rds := redis.NewClient(&redis.Options{Addr: mrds.Addr()})
	pgUrl := os.Getenv("PG_URL")
	db, err := gorm.Open(postgres.Open(pgUrl), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	reg := rpc.NewServiceRegistry("api")

	sm := auth.NewSessionManager(rds, "SM")

	return &Services{
		Db:  db,
		Rds: rds,
		Sm:  sm,
		Reg: reg,
	}

}
