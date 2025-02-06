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
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// // Ref: https://godoc.org/github.com/gin-gonic/contrib/sessions#Options
// store.Options(sessions.Options{
// 	MaxAge:   86400,
// 	Path:     "/",
// 	Secure:   true,
// 	HttpOnly: true,
// })

// func setupRedis(r *gin.Engine) {
// 	REDIS_URL := os.Getenv("REDIS_URL")
// 	if REDIS_URL == "" {
// 		log.Fatal("REDIS_URL is not set")
// 	}
// 	REDIS_SECRET := os.Getenv("REDIS_SECRET")
// 	if REDIS_SECRET == "" {
// 		log.Fatal("REDIS_SECRET is not set")
// 	}
// 	REDIS_PASSWORD := os.Getenv("REDIS_PASSWORD")
// 	store, err := redis.NewStore(10, "tcp", REDIS_URL, REDIS_PASSWORD, []byte(REDIS_SECRET))
// 	if err != nil {
// 		log.Fatalf("Error connecting to Redis: %v", err)
// 	}
//
// 	r.Use(sessions.Sessions("mysession", store))
//
// 	r.GET("/incr2", func(c *gin.Context) {
// 		session := sessions.Default(c)
// 		var count int
// 		v := session.Get("count2")
// 		if v == nil {
// 			count = 0
// 		} else {
// 			count = v.(int)
// 			count++
// 		}
// 		session.Set("count2", count)
// 		session.Save()
// 		c.JSON(200, gin.H{"count2": count})
// 	})
// }

func Run() {
	isProd := os.Getenv("ENVIRON") == "prod"
	sessionSecret := os.Getenv("SESSION_SECRET")
	authBaseURL := os.Getenv("AUTH_BASE_URL")
	if authBaseURL == "" {
		log.Fatal("AUTH_BASE_URL environment variable is not set")
	}
	if sessionSecret == "" {
		log.Fatal("SESSION_SECRET environment variable is not set")
	}

	auth.NewAuth(isProd, authBaseURL, 8640000, sessionSecret)

	r := gin.Default()

	dbdata, err := initDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	// TODO: cleanup
	AllowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	var allowedOrigins []string
	if AllowedOrigins == "" && !isProd {
		allowedOrigins = []string{"*"}
	} else if isProd {
		log.Fatal("ALLOWED_ORIGINS environment variable is not set")
	} else {
		allowedOrigins = strings.Split(AllowedOrigins, ",")
	}
	allowedOrigins = append(allowedOrigins, "http://localhost:3000")
	fmt.Println("allowedOrigins", allowedOrigins)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "PUT", "PATCH", "DELETE", "HEAD", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		AllowCredentials: true,
	}))
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

	api := r.Group("/api")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "up"})
	})
	shaderService := shaders.NewShaderService(shaders.NewShaderRepository(dbConn, queries))
	userService := user.NewUserService(user.NewUserRepository(queries))
	shaders.RegisterHandlers(api, shaderService)
	user.RegisterHandlers(r, api, shaderService, userService)
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
