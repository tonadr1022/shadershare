package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type (
	Auth interface {
		GenerateAccessToken(userID uuid.UUID, email string) (string, error)
		GenerateRefreshToken(userID uuid.UUID, email string) (string, error)
		ParseJWTWithClaims(tokenString string) (*UserClaims, error)
		SetAccessTokenCookie(ctx *gin.Context, token string)
		SetRefreshTokenCookie(ctx *gin.Context, token string)
	}
	UserClaims struct {
		ID    uuid.UUID `json:"id"`
		Email string    `json:"email"`
		jwt.RegisteredClaims
	}

	JWTPair struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}

	AuthSettings struct {
		JWTSecret          string
		AccessTokenMaxAge  time.Duration
		RefreshTokenMaxAge time.Duration
		Secure             bool
		HttpOnly           bool
	}
)

type auth struct {
	settings *AuthSettings
}

var _ Auth = (*auth)(nil)

var instance *auth

func Instance() Auth {
	if instance == nil {
		panic("auth instance not initialized. Call InitAuth first.")
	}
	return instance
}

func InitAuth(authSettings *AuthSettings) {
	instance = &auth{settings: authSettings}
}

func (a *auth) ParseJWTWithClaims(tokenString string) (*UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(a.settings.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("token parsing error: %w", err)
	}

	if claims, ok := token.Claims.(*UserClaims); ok {
		return claims, nil
	}

	return nil, errors.New("invalid token payload")
}

func (a *auth) GenerateAccessToken(userID uuid.UUID, email string) (string, error) {
	return a.generateJWT(userID, email, a.settings.AccessTokenMaxAge)
}

func (a *auth) GenerateRefreshToken(userID uuid.UUID, email string) (string, error) {
	return a.generateJWT(userID, email, a.settings.RefreshTokenMaxAge)
}

func (a *auth) generateJWT(userID uuid.UUID, email string, lifeTime time.Duration) (string, error) {
	claims := UserClaims{
		ID:    userID,
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "ShaderShareAPI",
			Subject:   "User Authentication",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(lifeTime)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.settings.JWTSecret))
}

func (a *auth) SetAccessTokenCookie(ctx *gin.Context, token string) {
	ctx.SetCookie("accessToken", token, int((a.settings.AccessTokenMaxAge).Seconds()), "/", "", a.settings.Secure, a.settings.HttpOnly)
}

func (a *auth) SetRefreshTokenCookie(ctx *gin.Context, token string) {
	ctx.SetCookie("refreshToken", token, int((a.settings.RefreshTokenMaxAge).Seconds()), "/", "", a.settings.Secure, a.settings.HttpOnly)
}
