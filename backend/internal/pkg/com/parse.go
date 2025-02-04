package com

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func ParseDefaultQueryInt(c *gin.Context, key string, defaultValue int) (int, error) {
	valueStr := c.DefaultQuery(key, strconv.Itoa(defaultValue))
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return 0, err
	}
	return value, nil
}
