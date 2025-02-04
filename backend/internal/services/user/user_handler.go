package user

import (
	"fmt"
	"net/http"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/util"

	"github.com/gin-gonic/gin"
)

type userHandler struct {
	service domain.UserService
}

func RegisterHandlers(r *gin.RouterGroup, service domain.UserService) {
	h := userHandler{service}
	r.POST("/register", h.register)
	r.POST("/login", h.login)
}

func (h userHandler) login(c *gin.Context) {
	var payload domain.LoginPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}
	user, err := h.service.LoginUser(c, payload)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	c.JSON(200, user)
}

func (h userHandler) register(c *gin.Context) {
	var payload domain.CreateUserPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		fmt.Println(err)
		util.SetErrorResponse(c, http.StatusBadRequest, "Invalid payload")
		return
	}

	loginResp, err := h.service.RegisterUser(c, payload)
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
	c.JSON(http.StatusOK, loginResp)
}
