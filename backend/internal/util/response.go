package util

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

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

func getValidationErrors(err error) []string {
	var validationErrors []string
	if errors, ok := err.(validator.ValidationErrors); ok {
		for _, err := range errors {
			validationErrors = append(validationErrors, fmt.Sprintf("Field '%s' failed on '%s'", err.Field(), err.Tag()))
		}
	} else {
		validationErrors = append(validationErrors, err.Error())
	}
	return validationErrors
}

func ValidateMultiPartJSONAndSetErrors(c *gin.Context, payload interface{}) bool {
	jsonData := c.PostForm("json")
	if err := json.Unmarshal([]byte(jsonData), &payload); err != nil {

		SetErrorsResponse(c, http.StatusBadRequest, getValidationErrors(err))
		return false
	}
	return true
}

func ValidateContentTypeAndSetError(c *gin.Context, contentType string) bool {
	contentTypeHeader := c.GetHeader("Content-Type")
	if !strings.Contains(contentTypeHeader, "multipart/form-data") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content type"})
		return false
	}
	return true
}

func ValidateAndSetErrors(c *gin.Context, payload interface{}) bool {
	if err := c.ShouldBindJSON(&payload); err != nil {
		SetErrorsResponse(c, http.StatusBadRequest, getValidationErrors(err))
		return false
	}
	return true
}
