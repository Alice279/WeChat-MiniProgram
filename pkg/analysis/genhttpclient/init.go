package genhttpclient

import "golang.org/x/tools/go/analysis"

var Analyzer = &analysis.Analyzer{
	Name: "genhttpclient",
	Doc:  "Generate http client",
	Run:  run,
}

var output string

func init() {
	Analyzer.Flags.StringVar(&output, "output", output, "output ts file")
}
