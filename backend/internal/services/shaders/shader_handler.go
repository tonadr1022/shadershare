package shaders

import (
	"net/http"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/middleware"
	"shadershare/internal/pkg/com"
	"shadershare/internal/util"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ShaderHandler struct {
	service domain.ShaderService
}

func RegisterHandlers(r *gin.RouterGroup, service domain.ShaderService) {
	h := &ShaderHandler{service}
	r.GET("/shader", h.getShaderList)
	r.POST("/shader", middleware.Auth(), h.createShader)
	r.PUT("/shader/:id", middleware.Auth(), h.updateShader)
}

func (h ShaderHandler) updateShader(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	shaderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "Invalid shader ID")
		return
	}
	if !ok {
		util.SetInternalServiceErrorResponse(c)
	}
	var payload domain.UpdateShaderPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	shader, err := h.service.UpdateShader(c, userctx.ID, shaderID, payload)
	if err != nil {
		if err == e.ErrNotFound {
			util.SetErrorResponse(c, http.StatusNotFound, "Shader not found")
			return
		} else {
			util.SetInternalServiceErrorResponse(c)
			return
		}
	}
	c.JSON(http.StatusOK, shader)
}

func (h ShaderHandler) createShader(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	var payload domain.CreateShaderPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	shader, err := h.service.CreateShader(c, userctx.ID, payload)
	if err != nil {
		if err == e.ErrShaderWithTitleExists {
			util.SetErrorResponse(c, http.StatusBadRequest, "Shader with this title already exists")
			return
		}
		util.SetInternalServiceErrorResponse(c)
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
		util.SetInternalServiceErrorResponse(c)
		return
	}

	c.JSON(http.StatusOK, shaders)
}
