package user

import (
	"context"
	"fmt"
	"net/http"
	"shadershare/internal/auth"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/middleware"
	"shadershare/internal/pkg/com"
	"shadershare/internal/util"

	"github.com/gin-gonic/gin"
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

	r.GET("/profile", middleware.Auth(), h.profile)
	r.GET("/me", middleware.Auth(), h.me)
	r.POST("/logout", h.logout)
}

func (h userHandler) logout(c *gin.Context) {
	gothic.Logout(c.Writer, c.Request)
	c.SetSameSite(http.SameSiteLaxMode)
	auth.Instance().SetAccessTokenCookie(c, "")
	auth.Instance().SetRefreshTokenCookie(c, "")
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
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}

	category := c.Query("show")

	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "show parameter is required"})
		return
	}
	if category == "shaders" {
		limit, err := com.DefaultQueryIntCheck(c, "limit", 20)
		if err != nil {
			util.SetErrorResponse(c, http.StatusBadRequest, "Invalid limit")
			return
		}
		offset, err := com.DefaultQueryIntCheck(c, "offset", 0)
		if err != nil {
			util.SetErrorResponse(c, http.StatusBadRequest, "Invalid offset")
			return
		}

		shaders, err := h.shaderService.GetUserShaderList(c, userctx.ID, limit, offset)
		if err != nil {
			if err != e.ErrNotFound {
				util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
				return
			}
		}
		c.JSON(http.StatusOK, shaders)
		return
	}
	util.SetErrorResponse(c, http.StatusBadRequest, "Invalid category")
}

func (h userHandler) me(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetInternalServiceErrorResponse(c)
		return
	}
	user, err := h.userService.GetUserByID(c, userctx.ID)
	if err != nil {
		fmt.Println("err getting user", err)
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	c.JSON(http.StatusOK, user)
}
