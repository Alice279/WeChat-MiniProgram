package main

import (
	"github.com/heymind/puki/pkg/analysis/genhttpclient"
	"golang.org/x/tools/go/analysis/singlechecker"
)

func main() {
	singlechecker.Main(genhttpclient.Analyzer)
}
