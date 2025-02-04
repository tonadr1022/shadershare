package app

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type ApiServer struct {
	router *gin.Engine
	db     *gorm.DB
}

func (s *ApiServer) Run() {
	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "8080"
	}
	if err := s.router.Run(fmt.Sprintf(":%s", httpPort)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func NewApiServer() *ApiServer {
	r := gin.Default()
	setupRoutes(r)
	db := connectToDB()
	server := &ApiServer{
		router: r,
		db:     db,
	}
	return server
}

func connectToDB() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	var err error
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error connecting to the database %v", err)
	}
	return db
}

func setupRoutes(r *gin.Engine) {
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	api := r.Group("/api")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "up"})
	})
}
