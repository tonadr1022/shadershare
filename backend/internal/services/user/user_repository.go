package user

import (
	"context"
	"shadershare/internal/db"
	"shadershare/internal/domain"

	"github.com/google/uuid"
)

type userRepository struct {
	db *db.Queries
}

func NewUserRepository(db *db.Queries) userRepository {
	return userRepository{
		db: db,
	}
}

func (r userRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	dbuser, err := r.db.GetUserByID(ctx, id)
	if err != nil {
		return nil, db.TransformErrNoRows(err)
	}
	user := r.ToDomainUser(dbuser)
	return &user, nil
}

func (r userRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	dbuser, err := r.db.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, db.TransformErrNoRows(err)
	}

	user := r.ToDomainUser(dbuser)
	return &user, nil
}

func (r userRepository) GetUserByEmailOrUsername(ctx context.Context, email_or_username string) (*domain.User, error) {
	dbuser, err := r.db.GetUserByEmailOrUsername(ctx, email_or_username)
	if err != nil {
		return nil, db.TransformErrNoRows(err)
	}

	user := r.ToDomainUser(dbuser)
	return &user, nil
}

func (r userRepository) CreateUser(ctx context.Context, payload domain.CreateUserPayload) (*domain.User, error) {
	params := db.CreateUserParams{Username: payload.Username, Email: payload.Email, Password: payload.Password}
	dbuser, err := r.db.CreateUser(ctx, params)
	if err != nil {
		return nil, err
	}
	user := r.ToDomainUser(dbuser)
	return &user, nil
}

func (r userRepository) ToDomainUser(dbuser db.User) domain.User {
	return domain.User{
		ID:        dbuser.ID,
		Username:  dbuser.Username,
		Email:     dbuser.Email,
		Password:  dbuser.Password,
		CreatedAt: dbuser.CreatedAt.Time,
		UpdatedAt: dbuser.UpdatedAt.Time,
	}
}
