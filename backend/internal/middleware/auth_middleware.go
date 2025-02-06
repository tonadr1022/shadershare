package middleware

import (
	"net/http"
	"shadershare/internal/auth"
	"shadershare/internal/domain"
	"time"

	"github.com/gin-gonic/gin"
)

type jwtHeader struct {
	Authorization string `header:"Authorization"`
}

type contextKey int

const userKey contextKey = iota

func Auth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		accessToken, err := ctx.Request.Cookie("accessToken")
		if err == nil {
			// parse the jwt
			claims, err := auth.Instance().ParseJWTWithClaims(accessToken.Value)
			if err != nil {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				return
			}
			// check if the token is expired
			if claims.ExpiresAt.Unix() > time.Now().Unix() {
				// valid access token, authenticated
				userctx := &domain.UserCtx{ID: claims.ID}
				ctx.Set("currentUser", userctx)
				ctx.Next()
				return
			}
		}

		// expired or missing access token, try refresh token
		refreshToken, err := ctx.Request.Cookie("refreshToken")
		if err == nil {
			claims, err := auth.Instance().ParseJWTWithClaims(refreshToken.Value)
			if err != nil {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				return
			}
			if claims.ExpiresAt.Unix() > time.Now().Unix() {
				// refresh access token
				accessToken, err := auth.Instance().GenerateAccessToken(claims.ID, claims.Email)
				if err != nil {
					ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				}
				auth.Instance().SetAccessTokenCookie(ctx, accessToken)
				userctx := &domain.UserCtx{ID: claims.ID}
				ctx.Set("currentUser", userctx)
				ctx.Next()
				return
			}
		}

		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no refresh token, unauthenticated"})
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
