package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"shadershare/internal/db"
	"shadershare/internal/services/user"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type ApiServer struct {
	router *gin.Engine
	db     *db.Queries
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
	db, err := initDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	setupRoutes(r, db)
	server := &ApiServer{
		router: r,
		db:     db,
	}
	return server
}

func setupRoutes(r *gin.Engine, db *db.Queries) {
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	api := r.Group("/api")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "up"})
	})
	user.RegisterHandlers(api, user.NewUserService(user.NewUserRepository(db)))
}

func initDB() (*db.Queries, error) {
	conn, err := pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		return nil, fmt.Errorf("unable to connect to database: %v", err)
	}
	// ping
	if err := conn.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("unable to ping database: %v", err)
	}
	return db.New(conn), nil
}
