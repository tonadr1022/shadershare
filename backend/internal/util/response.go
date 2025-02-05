package util

import "github.com/gin-gonic/gin"

type ErrorResponse struct {
	Errors []string `json:"errors"`
}

func SetErrorResponse(c *gin.Context, status int, error string) {
	c.JSON(status, ErrorResponse{Errors: []string{error}})
}

func SetInternalServiceErrorResponse(c *gin.Context) {
	c.JSON(500, ErrorResponse{Errors: []string{"Internal Server Error"}})
}

func SetErrorsResponse(c *gin.Context, status int, errors []string) {
	c.JSON(status, ErrorResponse{Errors: errors})
}
