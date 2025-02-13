package shaders

import (
	"log"
	"net/http"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/filestore"
	"shadershare/internal/middleware"
	"shadershare/internal/pkg/com"
	"shadershare/internal/util"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ShaderHandler struct {
	service domain.ShaderService
}

func randomFileName(ext string) string {
	return uuid.New().String() + ext
}

var (
	defaultShaderGetLimit = 10
	maxShaderGetLimit     = 20
	defaultShaderGetSort  = "popularity"
)

func RegisterHandlers(r *gin.RouterGroup, service domain.ShaderService) {
	h := &ShaderHandler{service}
	r.GET("/shaders", h.getShaderList)
	r.GET("/shaders/:id", h.getShader)
	r.POST("/shaders", middleware.Auth(), h.createShader)
	r.PUT("/shaders/:id", middleware.Auth(), h.updateShader)
	// TODO: design better using query params?
	r.GET("/shaderswithusernames", h.getShaderListWithUsernames)
}

func (h ShaderHandler) getShaderListWithUsernames(c *gin.Context) {
	sort := c.DefaultQuery("sort", defaultShaderGetSort)
	limit, err := com.DefaultQueryIntCheck(c, "limit", defaultShaderGetLimit)
	if err != nil {
		return
	}
	limit = min(limit, maxShaderGetLimit)
	offset, err := com.DefaultQueryIntCheck(c, "offset", 0)
	if err != nil {
		return
	}

	shaders, err := h.service.GetShaderListWithUsernames(c, sort, limit, offset)
	if err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}

	c.JSON(http.StatusOK, shaders)
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
	if ok := util.ValidateContentTypeAndSetError(c, "multipart/form-data"); !ok {
		return
	}

	var payload domain.UpdateShaderPayload
	if ok := util.ValidateMultiPartJSONAndSetErrors(c, &payload); !ok {
		return
	}

	if userctx.ID != payload.UserID {
		util.SetErrorResponse(c, http.StatusForbidden, "You do not have permission to update this shader")
		return
	}

	// TODO: only get file if needed
	file, err := c.FormFile("file")
	if err != nil {
		if err != http.ErrMissingFile {
			util.SetErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
	}

	shader, err := h.service.UpdateShader(c, userctx.ID, shaderID, payload)
	if err != nil {
		if err == e.ErrNotFound {
			util.SetErrorResponse(c, http.StatusNotFound, "Shader not found or access denied")
			return
		} else {
			util.SetInternalServiceErrorResponse(c)
			return
		}
	}

	// update if exists already
	if payload.PreviewImgURL != nil && file != nil {
		err = filestore.UpdateFile(file, *payload.PreviewImgURL)
		if err != nil {
			log.Println("Error updating file", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	// update only after success

	c.JSON(http.StatusOK, shader)
}

func (h ShaderHandler) createShader(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	if ok := util.ValidateContentTypeAndSetError(c, "multipart/form-data"); !ok {
		return
	}

	var payload domain.CreateShaderPayload
	if ok := util.ValidateMultiPartJSONAndSetErrors(c, &payload); !ok {
		return
	}
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	file.Filename = randomFileName(".png")
	fileUrl, err := filestore.UploadFile(file)
	if err != nil {
		log.Println("Error uploading file", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	payload.PreviewImgURL = fileUrl

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
	limit = min(limit, 20)
	offset, err := com.DefaultQueryIntCheck(c, "offset", 0)
	if err != nil {
		return
	}

	shaders, err := h.service.GetShadersListWithRenderPasses(c, sort, limit, offset)
	if err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}

	c.JSON(http.StatusOK, shaders)
}

func (h ShaderHandler) getShader(c *gin.Context) {
	shaderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "Invalid shader ID")
		return
	}

	shader, err := h.service.GetShader(c, shaderID)
	if err != nil {
		if err == e.ErrNotFound {
			util.SetErrorResponse(c, http.StatusNotFound, "Shader not found")
			return
		}
		util.SetInternalServiceErrorResponse(c)
		return
	}

	c.JSON(http.StatusOK, shader)
}
