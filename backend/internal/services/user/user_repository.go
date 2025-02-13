package user

import (
	"context"
	"shadershare/internal/db"
	"shadershare/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type userRepository struct {
	queries *db.Queries
	db      *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool, queries *db.Queries) userRepository {
	return userRepository{
		queries: queries,
		db:      db,
	}
}

func (r userRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	dbuser, err := r.queries.GetUserByID(ctx, id)
	if err != nil {
		return nil, db.TransformErrNoRows(err)
	}
	user := r.ToDomainUser(dbuser)
	return &user, nil
}

func (r userRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	dbuser, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, db.TransformErrNoRows(err)
	}

	user := r.ToDomainUser(dbuser)
	return &user, nil
}

func (r userRepository) GetUserByEmailOrUsername(ctx context.Context, email_or_username string) (*domain.User, error) {
	dbuser, err := r.queries.GetUserByEmailOrUsername(ctx, email_or_username)
	if err != nil {
		return nil, db.TransformErrNoRows(err)
	}

	user := r.ToDomainUser(dbuser)
	return &user, nil
}

func (r userRepository) CreateUser(ctx context.Context, payload domain.CreateUserPayload) (*domain.User, error) {
	params := db.CreateUserParams{Username: payload.Username, Email: payload.Email, AvatarUrl: db.ToPgTypeText(payload.AvatarUrl)}
	dbuser, err := r.queries.CreateUser(ctx, params)
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
		AvatarUrl: dbuser.AvatarUrl.String,
		CreatedAt: dbuser.CreatedAt.Time,
		UpdatedAt: dbuser.UpdatedAt.Time,
	}
}

func (r userRepository) GetUsernames(ctx context.Context, userIds []uuid.UUID) ([]string, error) {
	items, err := getUsernames(r.db, ctx, userIds)
	if err != nil {
		return nil, err
	}
	return items, nil
}

func getUsernames(conn db.DBTX, ctx context.Context, userIds []uuid.UUID) ([]string, error) {
	rows, err := conn.Query(ctx, `-- name: GetUsernames :many
SELECT username FROM users
WHERE id = ANY($1)
`, userIds)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var username string
		if err := rows.Scan(&username); err != nil {
			return nil, err
		}
		items = append(items, username)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
