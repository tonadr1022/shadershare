package user

import (
	"context"
	"fmt"
	"net/http"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/middleware"
	"shadershare/internal/pkg/com"
	"shadershare/internal/util"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth/gothic"
)

type userHandler struct {
	userService   domain.UserService
	shaderService domain.ShaderService
}

func authCallback(c *gin.Context) {
	provider := c.Param("provider")
	c.Request = c.Request.WithContext(context.WithValue(c.Request.Context(), "provider", provider))
	fmt.Println("auth callback called, completing with gothic")
	oauthUser, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		fmt.Println("Error completing user auth:", err)
		util.SetErrorResponse(c, http.StatusInternalServerError, "Unexpected error")
		return
	}
	// store in DB, access token, refresh token logic
	accessToken := oauthUser.AccessToken
	refreshToken := oauthUser.RefreshToken
	session, err := gothic.Store.New(c.Request, "session_id")
	if err != nil {
		fmt.Println("Error creating session:", err)
		util.SetErrorResponse(c, http.StatusInternalServerError, "Unexpected error")
		return
	}
	session.Values["access_token"] = accessToken
	session.Values["refresh_token"] = refreshToken
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 30,
		HttpOnly: true,
		Secure:   false, // TODO:
	}
	if err := session.Save(c.Request, c.Writer); err != nil {
		fmt.Println("Error saving session:", err)
		util.SetErrorResponse(c, http.StatusInternalServerError, "Unexpected error")
		return
	}

	// if the user doesnt exist, create a user

	// if the user exists, update the user

	http.Redirect(c.Writer, c.Request, "http://localhost:3000", http.StatusFound)
}

func (h userHandler) login(c *gin.Context) {
	provider := c.Param("provider")
	c.Request = c.Request.WithContext(context.WithValue(c.Request.Context(), "provider", provider))
	// session, _ := gothic.Store.Get(c.Request, gothic.SessionName)
	// session.Values["provider"] = provider
	// session.Save(c.Request, c.Writer)
	fmt.Println("starting login with gothic")
	if gothUser, err := gothic.CompleteUserAuth(c.Writer, c.Request); err == nil {
		fmt.Println("User already logged in: ", gothUser)
		c.JSON(http.StatusOK, gin.H{"user": gothUser.Email})
	} else {
		fmt.Println("User not logged in, starting auth: ", err)
		gothic.BeginAuthHandler(c.Writer, c.Request)
	}
}

func RegisterHandlers(e *gin.Engine, r *gin.RouterGroup, shaderService domain.ShaderService, userService domain.UserService) {
	h := userHandler{userService, shaderService}
	e.GET("/auth/:provider", h.login)
	e.GET("/auth/:provider/callback", authCallback)
	e.GET("/auth/logout", h.logout)
	r.POST("/register", h.register)
	r.GET("/profile", middleware.Auth(), h.profile)
}

// func (h userHandler) login(c *gin.Context) {
// 	var payload domain.LoginPayload
// 	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
// 		return
// 	}
//
// 	userCtx, err := h.userService.LoginUser(c, payload)
// 	if err != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
// 		return
// 	}
// 	if ok := h.setSession(c, userCtx); !ok {
// 		return
// 	}
// 	c.JSON(200, userCtx)
// }

func (h userHandler) logout(c *gin.Context) {
	gothic.Logout(c.Writer, c.Request)
	// TODO: better redirect?
	c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000")
}

func (h userHandler) register(c *gin.Context) {
	var payload domain.CreateUserPayload
	if ok := util.ValidateAndSetErrors(c, &payload); !ok {
		return
	}

	userCtx, err := h.userService.RegisterUser(c, payload)
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
	c.JSON(http.StatusOK, userCtx)
}

func (h userHandler) profile(c *gin.Context) {
	userctx, ok := middleware.CurrentUser(c)
	if !ok {
		util.SetErrorResponse(c, http.StatusInternalServerError, "Internal Server Error")
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
