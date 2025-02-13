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

var (
	bucketName string
	client     *s3.Client
)

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

func SetupS3(isProd bool) {
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
	client = s3.NewFromConfig(cfg, func(o *s3.Options) {
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
}

func UpdateFile(file *multipart.FileHeader, fileURL string) error {
	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open file: %v", err)
	}
	// extract filename
	// comes after last slash
	filename := fileURL[strings.LastIndex(fileURL, "/")+1:]
	fmt.Println("filename", filename, fileURL)
	defer src.Close()
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: &bucketName,
		Key:    aws.String(filename),
		Body:   src,
		ACL:    s3types.ObjectCannedACLPublicRead,
	})
	if err != nil {
		return fmt.Errorf("failed to upload file: %v", err)
	}
	return nil
}

func UploadFile(file *multipart.FileHeader) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer src.Close()
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: &bucketName,
		Key:    aws.String(file.Filename),
		Body:   src,
		ACL:    s3types.ObjectCannedACLPublicRead,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %v", err)
	}
	// TODO: in prod need s3 url!
	minioURL := fmt.Sprintf("http://%s/%s/%s", "localhost:9000", bucketName, file.Filename)
	fmt.Println("minioURL", minioURL)
	return minioURL, nil
}
