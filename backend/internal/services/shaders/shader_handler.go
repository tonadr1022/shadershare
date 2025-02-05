package shaders

import (
	"net/http"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/middleware"
	"shadershare/internal/pkg/com"
	"shadershare/internal/util"

	"github.com/gin-gonic/gin"
)

type ShaderHandler struct {
	service domain.ShaderService
}

func RegisterHandlers(r *gin.RouterGroup, service domain.ShaderService) {
	h := &ShaderHandler{service}
	r.GET("/shader", h.getShaderList)
	r.POST("/shader", middleware.JWT(), h.createShader)
}

func (h ShaderHandler) createShader(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	var payload domain.CreateShaderPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	shader, err := h.service.CreateShader(c, userctx.ID, payload)
	if err != nil {
		if err == e.ErrShaderWithTitleExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Shader with this title already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, shader)
}

func (h ShaderHandler) getShaderList(c *gin.Context) {
	sort := c.DefaultQuery("sort", "popularity")
	limit, err := com.DefaultQueryIntCheck(c, "limit", 10)
	if err != nil {
		return
	}
	offset, err := com.DefaultQueryIntCheck(c, "offset", 0)
	if err != nil {
		return
	}

	shaders, err := h.service.GetShaderList(c, sort, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, shaders)
}
