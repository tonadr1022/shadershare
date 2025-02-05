package middleware

import (
	"net/http"
	"shadershare/internal/config"
	"shadershare/internal/domain"
	"shadershare/internal/util"
	"strings"

	"github.com/gin-gonic/gin"
)

type jwtHeader struct {
	Authorization string `header:"Authorization"`
}

type contextKey int

const userKey contextKey = iota

func JWT() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			ctx.Abort()
			return
		}

		tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		if tokenString == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			ctx.Abort()
			return
		}

		claims, err := util.ParseJWT(tokenString, config.JWTSecret)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			ctx.Abort()
			return
		}

		userctx := &domain.UserCtx{ID: claims.ID}
		ctx.Set("currentUser", userctx)
		ctx.Next()
	}
}

func CurrentUser(ctx *gin.Context) (*domain.UserCtx, bool) {
	user, exists := ctx.Get("currentUser")
	if !exists {
		return nil, false
	}
	userCtx, ok := user.(*domain.UserCtx)
	if !ok {
		return nil, false
	}
	return userCtx, true
}
