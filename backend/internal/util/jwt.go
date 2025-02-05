package util

import (
	"errors"
	"shadershare/internal/config"
	"shadershare/internal/domain"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func ParseJWT(tokenString, secretKey string) (*domain.UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &domain.UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	if claims, ok := token.Claims.(*domain.UserClaims); ok {
		return claims, nil
	}

	return nil, errors.New("invalid token payload")
}

func GenerateJWT(user domain.User) (string, error) {
	claims := domain.UserClaims{
		ID:    user.ID,
		Email: user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "YourAppName",
			Subject:   "User Authentication",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)), // Expires in 24 hours
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.JWTSecret))
}
