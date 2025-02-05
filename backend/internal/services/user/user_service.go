package user

import (
	"context"
	"shadershare/internal/domain"
	"shadershare/internal/e"

	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo domain.UserRepository
}

func NewUserService(repo domain.UserRepository) domain.UserService {
	return &service{repo: repo}
}

func (s service) RegisterUser(ctx context.Context, payload domain.CreateUserPayload) (*domain.UserCtx, error) {
	// check if user exists
	_, err := s.repo.GetUserByEmailOrUsername(ctx, payload.Username)
	if err == nil {
		return nil, e.ErrUsernameAlreadyExists
	}
	_, err = s.repo.GetUserByEmail(ctx, payload.Email)
	if err == nil {
		return nil, e.ErrEmailAlreadyExists
	}

	var hashPassword []byte
	hashPassword, err = s.hashPassword(payload.Password)
	if err != nil {
		return nil, err
	}
	payload.Password = string(hashPassword)
	user, err := s.repo.CreateUser(ctx, payload)
	if err != nil {
		return nil, err
	}

	userCtx := &domain.UserCtx{ID: user.ID}
	return userCtx, err
}

func (s service) LoginUser(ctx context.Context, payload domain.LoginPayload) (*domain.UserCtx, error) {
	user, err := s.repo.GetUserByEmailOrUsername(ctx, payload.UsernameOrEmail)
	if err != nil {
		return nil, e.ErrUserNotFound
	}
	if !s.passwordMatch(user.Password, payload.Password) {
		return nil, e.ErrInvalidCredentials
	}
	userCtx := &domain.UserCtx{ID: user.ID}
	return userCtx, err
}

func (s service) passwordMatch(hashedPassword string, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func (s service) hashPassword(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}
