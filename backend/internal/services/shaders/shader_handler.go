package shaders

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/middleware"
	"shadershare/internal/pkg/com"
	"shadershare/internal/util"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ShaderHandler struct {
	service         domain.ShaderService
	shadertoyApiKey string
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
	h := &ShaderHandler{service, os.Getenv("SHADERTOY_API_KEY")}
	r.GET("/shaders", h.getShaders)
	r.GET("/shaders/:id", h.getShader)
	r.POST("/shaders", middleware.Auth(), h.createShader)
	r.PUT("/shaders/:id", middleware.Auth(), h.updateShader)
	r.DELETE("/shaders/:id", middleware.Auth(), h.deleteShader)
	r.POST("/shaders/delete-bulk", middleware.Auth(), h.deleteShadersBulk)

	r.POST("/shaders/output", middleware.Auth(), h.createShaderOutput)
	r.POST("/shaders/input", middleware.Auth(), h.createShaderInput)

	r.DELETE("/shaders/input/:id", middleware.Auth(), h.deleteShaderInput)
	r.DELETE("/shaders/output/:id", middleware.Auth(), h.deleteShaderOutput)
	r.GET("/shadertoy/:id", h.getShadertoyShader)

	r.POST("/playlists/shaders", middleware.Auth(), h.createShaderPlaylist)
	r.GET("/playlists/shaders/:id", middleware.AuthOpt(), h.getPlaylist)
	r.DELETE("/playlists/shaders/:id", middleware.Auth(), h.deleteShaderPlaylist)
	r.GET("/playlists/shaders", h.getShaderPlaylists)
	r.PUT("/playlists/shaders/:id", middleware.Auth(), h.updateShaderPlaylist)
	r.POST("/playlists/shaders/:id/batch-add", middleware.Auth(), h.addShadersToPlaylist)
}

type bulkAddShaderPayload struct {
	ShaderIDs []uuid.UUID `json:"shader_ids" binding:"required"`
}

func (h ShaderHandler) addShadersToPlaylist(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	var payload bulkAddShaderPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	playlistID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "bad id")
		return
	}

	fmt.Println(playlistID, "ids", payload.ShaderIDs)
	err = h.service.AddShaderToPlaylistBulk(c, userctx.ID, playlistID, payload.ShaderIDs)
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// for _, s := range payload.ShaderIDs {
	// 	err := h.service.AddShaderToPlaylist(c, userctx.ID, s, playlistID)
	// 	if err != nil {
	// 		util.SetErrorResponse(c, http.StatusBadRequest, err.Error())
	// 		return
	// 	}
	// }
	//
	c.Status(http.StatusOK)
}

func (h ShaderHandler) updateShaderPlaylist(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	var payload domain.UpdatePlaylistPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	err := h.service.UpdateShaderPlaylist(c, userctx.ID, &payload)
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "failed to update shader playlist")
	}
}

func getUserIDAndSetErrors(c *gin.Context) (uuid.UUID, bool) {
	userID := uuid.Nil
	userIDStr := c.Query("user_id")
	if userIDStr != "" {
		id, err := uuid.Parse(userIDStr)
		if err != nil {
			util.SetErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
			return uuid.Nil, false
		}
		userID = id
	}
	return userID, true
}

func parseIDAndSetErrors(c *gin.Context) (uuid.UUID, bool) {
	parsedID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "invalid id")
		return uuid.Nil, false
	}
	return parsedID, true
}

func (h ShaderHandler) getShaderPlaylists(c *gin.Context) {
	userID, ok := getUserIDAndSetErrors(c)
	if !ok {
		return
	}

	limit, err := com.DefaultQueryIntCheck(c, "limit", -1)
	if err != nil {
		return
	}
	offset, err := com.DefaultQueryIntCheck(c, "offset", 0)
	if err != nil {
		return
	}
	res, err := h.service.ListShaderPlaylists(c, &domain.ListPlaylistReq{
		Limit:  limit,
		Offset: offset,
		UserID: userID,
	})
	if err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h ShaderHandler) deleteShaderPlaylist(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	parsedID, ok := parseIDAndSetErrors(c)
	if !ok {
		return
	}

	err := h.service.DeletePlaylist(c, userctx.ID, parsedID)
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "failed to delete playlist, unauthorized or doesn't exist")
	}

	c.Status(http.StatusNoContent)
}

func (h ShaderHandler) getPlaylist(c *gin.Context) {
	// TODO: access level
	userID := uuid.Nil
	userctx, ok := middleware.CurrentUser(c)
	if ok {
		fmt.Println("user id", userctx.ID)
		userID = userctx.ID
	}
	parsedID, ok := parseIDAndSetErrors(c)
	if !ok {
		return
	}
	includeShaders := com.StrToBool(c.DefaultQuery("shaders", "false"))
	res, err := h.service.GetPlaylist(c, userID, parsedID, includeShaders)
	if err != nil {
		if err == e.ErrUnauthorized {
			util.SetErrorResponse(c, http.StatusUnauthorized, err.Error())
		} else {
			util.SetInternalServiceErrorResponse(c)
		}
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h ShaderHandler) createShaderPlaylist(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	var payload domain.CreatePlaylistPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}
	fmt.Println("p", payload)
	res, err := h.service.CreateShaderPlaylist(c, userctx.ID, &payload)
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h ShaderHandler) updateShader(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
	}

	shaderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "Invalid shader ID")
		return
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

	shader, err := h.service.UpdateShader(c, userctx.ID, shaderID, payload, file)
	if err != nil {
		if err == e.ErrNotFound {
			util.SetErrorResponse(c, http.StatusNotFound, "Shader not found or access denied")
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
	if ok := util.ValidateContentTypeAndSetError(c, "multipart/form-data"); !ok {
		return
	}

	if c.Query("bulk") != "" {
		var payload domain.BulkCreateShaderPayload
		if ok := util.ValidateMultiPartJSONAndSetErrors(c, &payload); !ok {
			return
		}

		var (
			errors []gin.H
			badReq bool
			ids    []uuid.UUID
		)

		for i, shaderPayload := range payload.Shaders {
			file, err := c.FormFile(fmt.Sprintf("file_%d", i))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			id, err := h.service.CreateShader(c, userctx.ID, shaderPayload, file)
			if err != nil {
				if err == e.ErrShaderWithTitleExists {
					errors = append(errors, gin.H{"title": shaderPayload.Title, "error": "Shader with this title already exists"})
					badReq = true
				} else {
					errors = append(errors, gin.H{"title": shaderPayload.Title, "error": "Internal server error"})
				}
				continue
			}
			ids = append(ids, id)
		}
		if len(errors) > 0 {
			status := http.StatusBadRequest
			if !badReq {
				status = http.StatusInternalServerError
			}
			c.JSON(status, gin.H{
				"errors":  errors,
				"success": false,
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"ids":     ids,
			"success": true,
		})
	} else {
		var payload domain.CreateShaderPayload
		if ok := util.ValidateMultiPartJSONAndSetErrors(c, &payload); !ok {
			fmt.Println("tags:", payload.Tags)
			return
		}
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		id, err := h.service.CreateShader(c, userctx.ID, payload, file)
		if err != nil {
			if err == e.ErrShaderWithTitleExists {
				util.SetErrorResponse(c, http.StatusBadRequest, fmt.Sprintf("Shader with title \"%s\" already exists", payload.Title))
				return
			}

			util.SetErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": id})
	}
}

func (h ShaderHandler) getShaders(c *gin.Context) {
	var err error
	detailed := com.StrToBool(c.DefaultQuery("detailed", "false"))

	userID, ok := getUserIDAndSetErrors(c)
	if !ok {
		return
	}

	limit, err := com.DefaultQueryIntCheck(c, "limit", -1)
	if err != nil {
		return
	}
	offset, err := com.DefaultQueryIntCheck(c, "offset", 0)
	if err != nil {
		return
	}
	// includes query params is an array of strings
	includeQuery := c.DefaultQuery("include", "")
	includes := strings.Split(includeQuery, ",")
	includeUser := slices.Contains(includes, "username")
	query := c.Query("query")
	decodedQuery, err := url.QueryUnescape(query)
	if err != nil {
		query = ""
	}
	decodedQuery = strings.ReplaceAll(decodedQuery, " ", "&")

	getShadersReq := domain.ShaderListReq{
		Sort:        c.DefaultQuery("sort", ""),
		SortReverse: com.StrToBool(c.DefaultQuery("desc", "false")),
		Limit:       limit,
		Offset:      offset,
		Filter: domain.GetShaderFilter{
			UserID:      userID,
			AccessLevel: domain.AccessLevelPublic,
			Query:       decodedQuery,
		},
		ShaderReqBase: domain.ShaderReqBase{
			Detailed:        detailed,
			IncludeUserData: includeUser,
		},
	}
	shaders, err := h.service.GetShaders(c, getShadersReq)
	if err != nil {
		if err == e.ErrInvalidSort {
			util.SetErrorResponse(c, http.StatusBadRequest, e.ErrInvalidSort.Error())
			return
		} else {
			util.SetInternalServiceErrorResponse(c)
			return
		}
	}
	c.JSON(http.StatusOK, shaders)
}

func (h ShaderHandler) getShader(c *gin.Context) {
	shaderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusNotFound, "Shader not found")
		return
	}
	detailed := com.StrToBool(c.DefaultQuery("detailed", "false"))
	includeQuery := c.DefaultQuery("include", "")
	includes := strings.Split(includeQuery, ",")
	includeUser := slices.Contains(includes, "username")

	getShaderReq := domain.ShaderByIdReq{
		ID: shaderID,
		ShaderReqBase: domain.ShaderReqBase{
			Detailed:        detailed,
			IncludeUserData: includeUser,
		},
	}
	shader, err := h.service.GetShader(c, getShaderReq)
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

func (h ShaderHandler) createShaderOutput(c *gin.Context) {
	_, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	var payload domain.CreateShaderOutputPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	shaderOutput, err := h.service.CreateShaderOutput(c, payload)
	if err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}

	c.JSON(http.StatusOK, shaderOutput)
}

func (h ShaderHandler) createShaderInput(c *gin.Context) {
	_, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	var payload domain.CreateShaderInputPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	shaderInput, err := h.service.CreateShaderInput(c, payload)
	if err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	c.JSON(http.StatusOK, shaderInput)
}

func (h ShaderHandler) deleteShaderInput(c *gin.Context) {
	_, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	inputID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "Invalid input ID")
		return
	}

	err = h.service.DeleteShaderInput(c, inputID)
	if err != nil {
		if err == e.ErrNotFound {
			util.SetNotFound(c)
			return
		}
		util.SetInternalServiceErrorResponse(c)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h ShaderHandler) deleteShaderOutput(c *gin.Context) {
	_, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	outputID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "Invalid output ID")
		return
	}

	err = h.service.DeleteShaderOutput(c, outputID)
	if err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h ShaderHandler) deleteShader(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	shaderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "Invalid shader ID")
		return
	}

	err = h.service.DeleteShader(c, userctx.ID, shaderID)
	if err != nil {
		if err == e.ErrNotFound {
			util.SetErrorResponse(c, http.StatusNotFound, "Shader not found")
			return
		}
		util.SetInternalServiceErrorResponse(c)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h ShaderHandler) getShadertoyShader(c *gin.Context) {
	resp, err := http.Get(fmt.Sprintf("https://www.shadertoy.com/api/v1/shaders/%s?key=rdHlhm", c.Param("id")))
	if resp.StatusCode == http.StatusForbidden || err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	var jsonData map[string]any
	if err := json.Unmarshal(body, &jsonData); err != nil {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	c.JSON(resp.StatusCode, jsonData)
}

func (h ShaderHandler) deleteShadersBulk(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	var payload []uuid.UUID
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}
	res, err := h.service.DeleteShadersBulk(c, userctx.ID, payload)
	if err != nil {
		util.SetInternalServiceErrorResponse(c)
	}
	c.JSON(http.StatusOK, res)
}
