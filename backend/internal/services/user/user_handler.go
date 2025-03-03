package user

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"shadershare/internal/auth"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/middleware"
	"shadershare/internal/pkg/com"
	"shadershare/internal/util"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/markbates/goth/gothic"
)

type userHandler struct {
	userService   domain.UserService
	shaderService domain.ShaderService
	baseClientUrl string
}

func RegisterHandlers(baseUrl string, e *gin.Engine, r *gin.RouterGroup, shaderService domain.ShaderService, userService domain.UserService) {
	h := userHandler{userService, shaderService, baseUrl}
	e.GET("/auth/:provider/callback", h.oauthCallback)
	r.GET("/auth/:provider", h.loginWithProvider)

	r.PUT("/profile", middleware.Auth(), h.updateProfile)
	r.GET("/profile", middleware.Auth(), h.profile)
	// me := r.Group("/me", middleware.Auth())
	// me.GET("/", h.me)
	// me.GET("/shaders", h.getUserShaders)
	r.GET("/me", middleware.Auth(), h.me)
	r.GET("/me/shaders", middleware.Auth(), h.getUserShaders)
	r.POST("/logout", h.logout)
	r.GET("/user/:id", h.getUser)
}

func (h userHandler) getUser(c *gin.Context) {
	userID := c.Param("id")
	parsedID, err := uuid.Parse(userID)
	if err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "Bad UserID")
	}
	user, err := h.userService.GetUserByID(c, parsedID)
	if err != nil {
		fmt.Println("get user err", err)
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h userHandler) logout(c *gin.Context) {
	gothic.Logout(c.Writer, c.Request)
	c.SetSameSite(http.SameSiteLaxMode)
	auth.Instance().ClearAuthCookies(c)
	c.JSON(http.StatusOK, gin.H{"message": "User logged out successfully"})
}

func (h userHandler) oauthCallback(c *gin.Context) {
	provider := c.Param("provider")
	ctx := context.WithValue(c.Request.Context(), "provider", provider)
	c.Request = c.Request.WithContext(ctx)
	oauthUser, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		fmt.Println(err)
		return
	}
	tokens, err := h.userService.CompleteOAuthLogin(c, &domain.OAuthPayload{Email: oauthUser.Email, AvatarUrl: oauthUser.AvatarURL})
	if err != nil {
		fmt.Println(err)
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	auth.Instance().SetAccessTokenCookie(c, tokens.AccessToken)
	auth.Instance().SetRefreshTokenCookie(c, tokens.RefreshToken)
	c.Redirect(http.StatusFound, h.baseClientUrl)
}

func (h userHandler) loginWithProvider(c *gin.Context) {
	provider := c.Param("provider")
	ctx := context.WithValue(c.Request.Context(), "provider", provider)

	c.Request = c.Request.WithContext(ctx)
	gothic.BeginAuthHandler(c.Writer, c.Request)
}

func (h userHandler) profile(c *gin.Context) {
	util.SetErrorResponse(c, http.StatusBadRequest, "Invalid category")
}

func (h userHandler) getUserShaders(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}

	detailed := com.StrToBool(c.DefaultQuery("detailed", "false"))
	limit, err := com.DefaultQueryIntCheck(c, "limit", -1)
	if err != nil {
		return
	}
	offset, err := com.DefaultQueryIntCheck(c, "offset", 0)
	if err != nil {
		return
	}
	query := c.Query("query")
	decodedQuery, err := url.QueryUnescape(query)
	if err != nil {
		query = ""
	}
	decodedQuery = strings.Replace(decodedQuery, " ", "&", -1)
	fmt.Println(decodedQuery)

	getShadersReq := domain.ShaderListReq{
		Limit:       limit,
		Offset:      offset,
		Sort:        c.Query("sort"),
		SortReverse: com.StrToBool(c.DefaultQuery("desc", "false")),
		Filter: domain.GetShaderFilter{
			UserID:      userctx.ID,
			AccessLevel: domain.AccessLevelNull,
			Query:       decodedQuery,
		},
		ShaderReqBase: domain.ShaderReqBase{
			Detailed:        detailed,
			IncludeUserData: false,
		},
	}
	shaders, err := h.shaderService.GetShaders(c, getShadersReq)
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

func (h userHandler) me(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	user, err := h.userService.GetUserByID(c, userctx.ID)
	if err != nil {
		fmt.Println("get user err", err)
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h userHandler) updateProfile(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}

	var payload domain.UserUpdatePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		util.SetErrorResponse(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, err := h.userService.UpdateProfile(c, userctx.ID, payload)
	if err != nil {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	c.JSON(http.StatusOK, user)
}
