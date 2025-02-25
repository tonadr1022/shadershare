package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"shadershare/internal/auth"
	"shadershare/internal/db"
	"shadershare/internal/filestore"
	"shadershare/internal/services/shaders"
	"shadershare/internal/services/user"
	"shadershare/internal/util"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Run() {
	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = "dev"
	}
	baseClientUrl := os.Getenv("BASE_CLIENT_URL")
	if baseClientUrl == "" {
		log.Fatal("BASE_CLIENT_URL is not set")
	}

	isProd := environment == "prod"
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is not set")
	}

	var domain string
	var sameSite http.SameSite
	if isProd {
		sameSite = http.SameSiteNoneMode
		domain = ""
	} else {
		domain = ""
		sameSite = http.SameSiteLaxMode
	}

	auth.InitAuth(&auth.AuthSettings{
		JWTSecret:          jwtSecret,
		AccessTokenMaxAge:  15 * time.Minute,
		RefreshTokenMaxAge: 30 * 24 * time.Hour,
		Secure:             isProd,
		HttpOnly:           true,
		Domain:             domain,
		SameSite:           sameSite,
	}, isProd)

	r := gin.Default()

	dbConn, err := initDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	fileStore := filestore.NewS3FileStore(isProd)

	defer dbConn.Close()

	config := cors.DefaultConfig()

	allowedOrigins := []string{baseClientUrl}
	if environment == "dev" {
		allowedOrigins = append(allowedOrigins, "http://localhost:8080")
	}
	fmt.Println("allowed origins", allowedOrigins)

	if isProd {
		config.AllowOrigins = []string{"https://shader-share.com", "https://www.shader-share.com"}
	} else {
		config.AllowOrigins = allowedOrigins
	}
	config.AllowCredentials = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "HEAD", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	queries := db.New(dbConn)
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	r.POST("/api/v1/upload-image", func(c *gin.Context) {
		contentType := c.GetHeader("Content-Type")
		if !strings.Contains(contentType, "multipart/form-data") {
			log.Println("Invalid content type", contentType)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content type"})
			return
		}
		type TestType struct {
			Test string `json:"test"`
		}
		var payload TestType
		if ok := util.ValidateMultiPartJSONAndSetErrors(c, &payload); !ok {
			return
		}
		file, err := c.FormFile("file")
		if err != nil {
			fmt.Println("error uploading file", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		fileUrl, err := fileStore.UploadFile(file)
		if err != nil {
			log.Println("Error uploading file", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "url": fileUrl})
	})

	api := r.Group("/api/v1")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "up"})
	})

	shadersRepo := shaders.NewShaderRepository(dbConn, queries)
	usersRepo := user.NewUserRepository(dbConn, queries)
	shaderService := shaders.NewShaderService(shadersRepo, usersRepo, fileStore)
	util.InitUsernameGenerator()
	userService := user.NewUserService(usersRepo)
	shaders.RegisterHandlers(api, shaderService)
	user.RegisterHandlers(baseClientUrl, r, api, shaderService, userService)

	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "8080"
	}
	if err := r.Run(fmt.Sprintf(":%s", httpPort)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func initDB() (*pgxpool.Pool, error) {
	config, _ := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
	dbPool, err := pgxpool.NewWithConfig(context.Background(), config)
	// conn, err := pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		return nil, fmt.Errorf("unable to connect to database: %v", err)
	}
	// ping
	if err := dbPool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("unable to ping database: %v", err)
	}
	return dbPool, nil
}
