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

func authImpl(optional bool, ctx *gin.Context) error {
	accessToken, err := ctx.Request.Cookie("accessToken")
	if err == nil {
		// parse the jwt
		claims, err := auth.Instance().ParseJWTWithClaims(accessToken.Value)
		if err != nil {
			if !optional {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			}
			return err
		}
		// check if the token is expired
		if claims.ExpiresAt.Unix() > time.Now().Unix() {
			// valid access token, authenticated
			userctx := &domain.UserCtx{ID: claims.ID}
			ctx.Set("currentUser", userctx)
			return nil
		}
	}

	// expired or missing access token, try refresh token
	refreshToken, err := ctx.Request.Cookie("refreshToken")
	if err == nil {
		claims, err := auth.Instance().ParseJWTWithClaims(refreshToken.Value)
		if err != nil {
			if !optional {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			}
			return err
		}
		if claims.ExpiresAt.Unix() > time.Now().Unix() {
			// refresh access token and rotate refresh
			accessToken, err := auth.Instance().GenerateAccessToken(claims.ID, claims.Email)
			if err != nil {
				if !optional {
					ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				}
				return err
			}
			newRefreshToken, err := auth.Instance().GenerateRefreshToken(claims.ID, claims.Email)
			if err != nil {
				if !optional {
					ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
				}
				return err
			}
			auth.Instance().SetRefreshTokenCookie(ctx, newRefreshToken)
			auth.Instance().SetAccessTokenCookie(ctx, accessToken)
			userctx := &domain.UserCtx{ID: claims.ID}
			ctx.Set("currentUser", userctx)
			return nil
		}
	}
	if !optional {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
	}
	return nil
}

func AuthOpt() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authImpl(true, ctx)
		ctx.Next()
	}
}

func Auth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		err := authImpl(false, ctx)
		if err == nil {
			ctx.Next()
		}
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
