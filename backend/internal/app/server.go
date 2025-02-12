package app

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"shadershare/internal/auth"
	"shadershare/internal/db"
	"shadershare/internal/services/shaders"
	"shadershare/internal/services/user"
	"shadershare/internal/util"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

var bucketName string

func printObjects(client *s3.Client) {
	fmt.Println("bucket: ", bucketName)
	listObjectsOutput, err := client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: &bucketName,
	})
	if err != nil {
		log.Fatal(err)
	}

	for _, object := range listObjectsOutput.Contents {
		obj, _ := json.MarshalIndent(object, "", "\t")
		fmt.Println(string(obj))
	}
}

func setupS3(isProd bool) *s3.Client {
	bucketName = os.Getenv("S3_BUCKET_NAME")
	// accountID := os.Getenv("S3_ACCOUNT_ID")
	accessKeyID := os.Getenv("AWS_ACCESS_KEY_ID")
	accessKeySecret := os.Getenv("AWS_ACCESS_KEY_SECRET")
	region := os.Getenv("AWS_REGION")
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyID, accessKeySecret, "")),
		config.WithRegion(region),
	)
	if err != nil {
		log.Fatal(err)
	}
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(os.Getenv("S3_ENDPOINT_URL"))
		if !isProd {
			o.UsePathStyle = true
		}
	})
	// TODO: make bucket if not exists in prod too?
	if !isProd {
		_, err := client.CreateBucket(context.TODO(), &s3.CreateBucketInput{
			Bucket: &bucketName,
		})
		if err != nil {
			_, errBucketExists := client.HeadBucket(context.TODO(), &s3.HeadBucketInput{
				Bucket: &bucketName,
			})
			if errBucketExists != nil {
				log.Fatal(err)
			}
		}
	}
	return client
}

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

	auth.InitAuth(&auth.AuthSettings{
		JWTSecret:          jwtSecret,
		AccessTokenMaxAge:  15 * time.Minute,
		RefreshTokenMaxAge: 30 * 24 * time.Hour,
		Secure:             isProd,
		HttpOnly:           true,
	}, isProd)

	r := gin.Default()

	dbConn, err := initDB()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	client := setupS3(isProd)

	defer dbConn.Close()

	config := cors.DefaultConfig()

	allowedOrigins := []string{baseClientUrl}
	if environment == "dev" {
		allowedOrigins = append(allowedOrigins, "http://localhost:3000", "http://localhost:8080")
	}
	config.AllowOrigins = allowedOrigins
	config.AllowCredentials = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "HEAD", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	queries := db.New(dbConn)
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})
	r.GET("/test-objects", func(c *gin.Context) {
		printObjects(client)
	})
	api := r.Group("/api/v1")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "up"})
	})

	shaderService := shaders.NewShaderService(shaders.NewShaderRepository(dbConn, queries))
	util.InitUsernameGenerator()
	userService := user.NewUserService(user.NewUserRepository(queries))
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
