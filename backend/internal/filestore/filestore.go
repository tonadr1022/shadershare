package filestore

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type FileStore interface {
	UploadFile(file *multipart.FileHeader) (string, error)
	UpdateFile(file *multipart.FileHeader, fileURL string) error
	RemoveFile(ctx context.Context, file string) error
}

type s3FileStore struct {
	bucketName   string
	client       *s3.Client
	isProd       bool
	baseEndpoint string
}

func NewS3FileStore(isProd bool) FileStore {
	fileStore := &s3FileStore{}
	fileStore.isProd = isProd
	fileStore.setupS3(isProd)
	return fileStore
}

func (s *s3FileStore) PrintObjects(client *s3.Client) {
	fmt.Println("bucket: ", s.bucketName)
	listObjectsOutput, err := client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: &s.bucketName,
	})
	if err != nil {
		log.Fatal(err)
	}

	for _, object := range listObjectsOutput.Contents {
		obj, _ := json.MarshalIndent(object, "", "\t")
		fmt.Println(string(obj))
	}
}

func (s *s3FileStore) setupS3(isProd bool) {
	s.bucketName = os.Getenv("S3_BUCKET_NAME")
	// accountID := os.Getenv("S3_ACCOUNT_ID")
	accessKeyID := os.Getenv("AWS_ACCESS_KEY_ID")
	accessKeySecret := os.Getenv("AWS_ACCESS_KEY_SECRET")
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyID, accessKeySecret, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		log.Fatal(err)
	}
	s.baseEndpoint = os.Getenv("S3_ENDPOINT_URL")
	s.client = s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(s.baseEndpoint)
		if !isProd {
			o.UsePathStyle = true
		}
	})
	if !isProd {
		_, err := s.client.CreateBucket(context.TODO(), &s3.CreateBucketInput{
			Bucket: &s.bucketName,
		})
		if err != nil {
			_, errBucketExists := s.client.HeadBucket(context.TODO(), &s3.HeadBucketInput{
				Bucket: &s.bucketName,
			})
			if errBucketExists != nil {
				log.Fatal(err)
			}
		}
	}
}

func (s *s3FileStore) UpdateFile(file *multipart.FileHeader, fileURL string) error {
	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open file: %v", err)
	}
	// extract filename
	// comes after last slash
	filename := fileURL[strings.LastIndex(fileURL, "/")+1:]
	defer src.Close()
	_, err = s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      &s.bucketName,
		Key:         aws.String(filename),
		Body:        src,
		ACL:         s3types.ObjectCannedACLPublicRead,
		ContentType: aws.String(file.Header.Get("Content-Type")),
	})
	if err != nil {
		return fmt.Errorf("failed to upload file: %v", err)
	}
	return nil
}

func (s *s3FileStore) RemoveFile(ctx context.Context, file string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: &s.bucketName,
		Key:    aws.String(file),
	})
	return err
}

func (s *s3FileStore) UploadFile(file *multipart.FileHeader) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()
	_, err = s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      &s.bucketName,
		Key:         aws.String(file.Filename),
		Body:        src,
		ACL:         s3types.ObjectCannedACLPublicRead,
		ContentType: aws.String(file.Header.Get("Content-Type")),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %v", err)
	}
	if s.isProd {
		return fmt.Sprintf("https://media.shader-share.com/%s", file.Filename), nil
	}
	minioURL := fmt.Sprintf("http://%s/%s/%s", "localhost:9000", s.bucketName, file.Filename)
	return minioURL, nil
}
