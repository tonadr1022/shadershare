package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"shadershare/internal/auth"
	"shadershare/internal/db"
	"shadershare/internal/services/shaders"
	"shadershare/internal/services/user"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func Run() {
	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = "dev"
	}

	isProd := environment == "prod"
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is not set")
	}

	auth.InitAuth(&auth.AuthSettings{
		JWTSecret:          jwtSecret,
		AccessTokenMaxAge:  15 * time.Minute,
		RefreshTokenMaxAge: 30 * 24 * time.Hour,
		Secure:             isProd,
		HttpOnly:           true,
	})

	r := gin.Default()

	dbdata, err := initDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowCredentials = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "HEAD", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	setupRoutes(r, dbdata)

	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "8080"
	}
	if err := r.Run(fmt.Sprintf(":%s", httpPort)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func setupRoutes(r *gin.Engine, dbConn *pgx.Conn) {
	queries := db.New(dbConn)
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	api := r.Group("/api/v1")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "up"})
	})
	shaderService := shaders.NewShaderService(shaders.NewShaderRepository(dbConn, queries))
	userService := user.NewUserService(user.NewUserRepository(queries))
	shaders.RegisterHandlers(api, shaderService)
	user.RegisterHandlers(api, shaderService, userService)
}

func initDB() (*pgx.Conn, error) {
	conn, err := pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		return nil, fmt.Errorf("unable to connect to database: %v", err)
	}
	// ping
	if err := conn.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("unable to ping database: %v", err)
	}
	return conn, nil
}
