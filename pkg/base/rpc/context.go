package rpc

import (
	"context"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"
)

type Context struct {
	Ctx context.Context
	*log.Entry
	ID       string
	Endpoint string
	Request  *http.Request
	Writer   http.ResponseWriter
}

func (c *Context) Deadline() (deadline time.Time, ok bool) {
	return c.Ctx.Deadline()
}

func (c *Context) Done() <-chan struct{} {
	return c.Ctx.Done()
}

func (c *Context) Err() error {
	return c.Ctx.Err()
}

func (c *Context) Value(key interface{}) interface{} {
	return c.Ctx.Value(key)
}
