package auth

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
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
		Domain             string
		SameSite           http.SameSite
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

func InitAuth(authSettings *AuthSettings, isProd bool) {
	instance = &auth{settings: authSettings}
	instance.InitOauth(isProd)
}

func (a *auth) InitOauth(isProd bool) {
	key := os.Getenv("OAUTH_SESSION_SECRET")
	maxAge := 86400 * 30

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(maxAge)
	store.Options.Path = "/"
	store.Options.HttpOnly = false
	store.Options.Secure = isProd
	store.Options.SameSite = http.SameSiteLaxMode
	gothic.Store = store
	baseURL := os.Getenv("AUTH_BASE_URL")
	goth.UseProviders(
		google.New(os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_CLIENT_SECRET"),
			fmt.Sprintf("%s/auth/google/callback", baseURL), "email", "profile"),
		github.New(os.Getenv("GITHUB_CLIENT_ID"), os.Getenv("GITHUB_CLIENT_SECRET"),
			fmt.Sprintf("%s/auth/github/callback", baseURL), "email", "read:user"))
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
	ctx.SetSameSite(a.settings.SameSite)
	ctx.SetCookie("accessToken", token, int((a.settings.AccessTokenMaxAge).Seconds()), "/", a.settings.Domain, a.settings.Secure, a.settings.HttpOnly)
}

func (a *auth) SetRefreshTokenCookie(ctx *gin.Context, token string) {
	ctx.SetSameSite(a.settings.SameSite)
	ctx.SetCookie("refreshToken", token, int((a.settings.RefreshTokenMaxAge).Seconds()), "/", a.settings.Domain, a.settings.Secure, a.settings.HttpOnly)
}
