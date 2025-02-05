package util

import (
	"fmt"
	"net/http"

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

func ValidateAndSetErrors(c *gin.Context, payload interface{}) bool {
	if err := c.ShouldBindJSON(&payload); err != nil {
		var validationErrors []string
		if errors, ok := err.(validator.ValidationErrors); ok {
			for _, err := range errors {
				validationErrors = append(validationErrors, fmt.Sprintf("Field '%s' failed on '%s'", err.Field(), err.Tag()))
			}
		} else {
			validationErrors = append(validationErrors, err.Error())
		}

		SetErrorsResponse(c, http.StatusBadRequest, validationErrors)
		return false
	}
	return true
}
