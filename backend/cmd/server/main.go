package main

import (
	"fmt"
	"shadershare/internal/app"
	"shadershare/internal/config"
)

func main() {
	fmt.Println("Starting Shadershare Server...")
	config.LoadConfig()
	app.Run()
}
