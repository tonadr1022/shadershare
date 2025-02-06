package domain

import (
	"context"
	"shadershare/internal/auth"
	"time"

	"github.com/google/uuid"
)

type (
	User struct {
		ID        uuid.UUID `json:"id"`
		Username  string    `json:"username"`
		Email     string    `json:"email"`
		Password  string    `json:"password"`
		CreatedAt time.Time
		UpdatedAt time.Time
	}

	UserCtx struct {
		ID    uuid.UUID
		Email string
	}

	CreateUserPayload struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	LoginPayload struct {
		UsernameOrEmail string `json:"username_or_email" binding:"required"`
		Password        string `json:"password" binding:"required"`
	}

	UserService interface {
		RegisterUser(ctx context.Context, payload CreateUserPayload) (auth.JWTPair, error)
		LoginUser(ctx context.Context, payload LoginPayload) (auth.JWTPair, error)
	}

	UserRepository interface {
		CreateUser(ctx context.Context, payload CreateUserPayload) (*User, error)
		GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)
		GetUserByEmail(ctx context.Context, email string) (*User, error)
		GetUserByEmailOrUsername(ctx context.Context, email_or_username string) (*User, error)
	}
)

func (u User) GetID() uuid.UUID {
	return u.ID
}
