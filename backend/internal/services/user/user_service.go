package user

import (
	"context"
	"os"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo                      domain.UserRepository
	jwtSecret                 string
	jwtTokenExpirationMinutes int
}

func NewUserService(repo domain.UserRepository) domain.UserService {
	return &service{repo: repo, jwtSecret: os.Getenv("JWT_SECRET")}
}

func (s service) RegisterUser(ctx context.Context, payload domain.CreateUserPayload) (domain.LoginResponse, error) {
	// check if user exists
	_, err := s.repo.GetUserByEmailOrUsername(ctx, payload.Username)
	if err == nil {
		return domain.LoginResponse{}, e.ErrUsernameAlreadyExists
	}
	_, err = s.repo.GetUserByEmail(ctx, payload.Email)
	if err == nil {
		return domain.LoginResponse{}, e.ErrEmailAlreadyExists
	}

	var hashPassword []byte
	hashPassword, err = s.hashPassword(payload.Password)
	if err != nil {
		return domain.LoginResponse{}, err
	}
	payload.Password = string(hashPassword)
	user, err := s.repo.CreateUser(ctx, payload)
	if err != nil {
		return domain.LoginResponse{}, err
	}

	token, err := s.generateJWT(*user)
	return domain.LoginResponse{Token: token}, err
}

func (s service) LoginUser(ctx context.Context, payload domain.LoginPayload) (domain.LoginResponse, error) {
	user, err := s.repo.GetUserByEmailOrUsername(ctx, payload.UsernameOrEmail)
	if err != nil {
		return domain.LoginResponse{}, e.ErrUserNotFound
	}
	if !s.passwordMatch(user.Password, payload.Password) {
		return domain.LoginResponse{}, e.ErrInvalidCredentials
	}
	token, err := s.generateJWT(*user)
	return domain.LoginResponse{Token: token}, err
}

func (s service) generateJWT(user domain.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Duration(s.jwtTokenExpirationMinutes * int(time.Minute))).Unix(),
	})
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (s service) passwordMatch(hashedPassword string, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func (s service) hashPassword(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}
