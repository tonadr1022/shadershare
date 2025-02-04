package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type (
	Identity interface {
		GetID() string
	}

	User struct {
		ID        uuid.UUID `json:"id"`
		Username  string    `json:"username"`
		Email     string    `json:"email"`
		Password  string    `json:"password"`
		CreatedAt time.Time
		UpdatedAt time.Time
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

	LoginResponse struct {
		Token string `json:"token"`
	}

	UserService interface {
		RegisterUser(ctx context.Context, payload CreateUserPayload) (LoginResponse, error)
		LoginUser(ctx context.Context, payload LoginPayload) (LoginResponse, error)
	}

	UserRepository interface {
		CreateUser(ctx context.Context, payload CreateUserPayload) (*User, error)
		GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)
		GetUserByEmail(ctx context.Context, email string) (*User, error)
		GetUserByEmailOrUsername(ctx context.Context, email_or_username string) (*User, error)
	}
)

func (u User) GetID() string {
	return u.ID.String()
}
