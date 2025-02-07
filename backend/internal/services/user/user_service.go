package user

import (
	"context"
	"fmt"
	"os"
	"shadershare/internal/auth"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/util"

	"github.com/google/uuid"
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

func generateTokenPair(userID uuid.UUID, email string) (auth.JWTPair, error) {
	access_token, err := auth.Instance().GenerateAccessToken(userID, email)
	if err != nil {
		return auth.JWTPair{}, err
	}
	refresh_token, err := auth.Instance().GenerateRefreshToken(userID, email)
	if err != nil {
		return auth.JWTPair{}, err
	}
	return auth.JWTPair{AccessToken: access_token, RefreshToken: refresh_token}, err
}

func (s service) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	return s.repo.GetUserByID(ctx, id)
}

func (s service) CompleteOAuthLogin(ctx context.Context, payload *domain.OAuthPayload) (auth.JWTPair, error) {
	// see if user exists with this email
	user, err := s.repo.GetUserByEmail(ctx, payload.Email)
	if err == e.ErrNotFound {
		// make a user
		user, err = s.repo.CreateUser(ctx, domain.CreateUserPayload{Username: util.RandUsername(), Email: payload.Email, AvatarUrl: payload.AvatarUrl})
		if err != nil {
			return auth.JWTPair{}, err
		}
	} else if err != nil {
		fmt.Println("unexpected db error", err)
		return auth.JWTPair{}, err
	}

	return generateTokenPair(user.ID, user.Email)
}

func (s service) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return s.repo.GetUserByEmail(ctx, email)
}

// func (s service) RegisterUser(ctx context.Context, payload domain.CreateUserPayload) (auth.JWTPair, error) {
// 	// check if user exists
// 	_, err := s.repo.GetUserByEmailOrUsername(ctx, payload.Username)
// 	if err == nil {
// 		return auth.JWTPair{}, e.ErrUsernameAlreadyExists
// 	}
// 	_, err = s.repo.GetUserByEmail(ctx, payload.Email)
// 	if err == nil {
// 		return auth.JWTPair{}, e.ErrEmailAlreadyExists
// 	}
//
// 	var hashPassword []byte
// 	hashPassword, err = s.hashPassword(payload.Password)
// 	if err != nil {
// 		return auth.JWTPair{}, err
// 	}
// 	payload.Password = string(hashPassword)
// 	user, err := s.repo.CreateUser(ctx, payload)
// 	if err != nil {
// 		return auth.JWTPair{}, err
// 	}
//
// 	return generateTokenPair(user.ID, user.Email)
// }

// func (s service) LoginUser(ctx context.Context, payload domain.LoginPayload) (auth.JWTPair, error) {
// 	user, err := s.repo.GetUserByEmailOrUsername(ctx, payload.UsernameOrEmail)
// 	if err != nil {
// 		return auth.JWTPair{}, e.ErrUserNotFound
// 	}
// 	if !s.passwordMatch(user.Password, payload.Password) {
// 		return auth.JWTPair{}, e.ErrInvalidCredentials
// 	}
// 	return generateTokenPair(user.ID, user.Email)
// }

func (s service) passwordMatch(hashedPassword string, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func (s service) hashPassword(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}
