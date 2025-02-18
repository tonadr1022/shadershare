package com

import (
	"fmt"
	"net/http"
	"shadershare/internal/util"
	"strconv"

	"github.com/gin-gonic/gin"
)

func DefaultQueryIntCheck(c *gin.Context, key string, defaultValue int) (int, error) {
	valueStr := c.DefaultQuery(key, strconv.Itoa(defaultValue))
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, fmt.Sprintf("Invalid %s", key))
		return 0, err
	}
	return value, nil
}

func IntQueryCheck(c *gin.Context, key string) (int, error) {
	valueStr := c.Query(key)
	if valueStr == "" {
		return 0, nil
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, fmt.Sprintf("Invalid %s", key))
		return 0, err
	}
	return value, nil
}
