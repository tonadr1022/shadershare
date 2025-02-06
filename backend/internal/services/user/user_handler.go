package user

import (
	"net/http"
	"shadershare/internal/auth"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/middleware"
	"shadershare/internal/pkg/com"
	"shadershare/internal/util"

	"github.com/gin-gonic/gin"
)

type userHandler struct {
	userService   domain.UserService
	shaderService domain.ShaderService
}

func RegisterHandlers(r *gin.RouterGroup, shaderService domain.ShaderService, userService domain.UserService) {
	h := userHandler{userService, shaderService}
	r.POST("/register", h.register)
	r.POST("/login", h.login)
	r.GET("/profile", middleware.Auth(), h.profile)
	r.GET("/me", middleware.Auth(), h.me)
}

func (h userHandler) login(c *gin.Context) {
	var payload domain.LoginPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	tokenPair, err := h.userService.LoginUser(c, payload)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	auth.Instance().SetAccessTokenCookie(c, tokenPair.AccessToken)
	auth.Instance().SetRefreshTokenCookie(c, tokenPair.RefreshToken)
	c.JSON(http.StatusOK, gin.H{"message": "User logged in successfully"})
}

func (h userHandler) register(c *gin.Context) {
	var payload domain.CreateUserPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	tokenPair, err := h.userService.RegisterUser(c, payload)
	if err == e.ErrEmailAlreadyExists {
		util.SetErrorResponse(c, http.StatusBadRequest, "Email already exists")
		return
	}
	if err == e.ErrUsernameAlreadyExists {
		util.SetErrorResponse(c, http.StatusBadRequest, "Username already exists")
		return
	}
	if err != nil {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Failed to register user")
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	auth.Instance().SetAccessTokenCookie(c, tokenPair.AccessToken)
	auth.Instance().SetRefreshTokenCookie(c, tokenPair.RefreshToken)
	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
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
			return
		}
		offset, err := com.DefaultQueryIntCheck(c, "offset", 0)
		if err != nil {
			return
		}

		shaders, err := h.shaderService.GetUserShaderList(c, userctx.ID, limit, offset)
		if err != nil {
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
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
	}
	c.JSON(http.StatusOK, user)
}
