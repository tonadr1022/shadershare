package shaders

import (
	"net/http"
	"shadershare/internal/domain"
	"shadershare/internal/pkg/com"

	"github.com/gin-gonic/gin"
)

type ShaderHandler struct {
	service domain.ShaderService
}

func NewShaderHandler(r *gin.RouterGroup, service domain.ShaderService) *ShaderHandler {
	h := &ShaderHandler{service}
	r.GET("/shader", h.getShaderList)
	r.POST("/shader", h.createShader)
	return h
}

func (h ShaderHandler) createShader(c *gin.Context) {
	var payload domain.CreateShaderPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	shader, err := h.service.CreateShader(c, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, shader)
}

func (h ShaderHandler) getShaderList(c *gin.Context) {
	sort := c.DefaultQuery("sort", "popularity")
	limit, err := com.ParseDefaultQueryInt(c, "limit", 10)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit"})
		return
	}
	offset, err := com.ParseDefaultQueryInt(c, "offset", 0)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset"})
		return
	}

	shaders, err := h.service.GetShaderList(c, sort, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, shaders)
}
