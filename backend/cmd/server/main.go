package main

import (
	"shadershare/internal/app"
)

func main() {
	server := app.NewApiServer()
	server.Run()
}
