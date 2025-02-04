// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: shader.sql

package db

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const createShader = `-- name: CreateShader :one
INSERT INTO shaders (
    description, user_id
) VALUES (
    $1, $2
) RETURNING id, description, user_id, created_at, updated_at
`

type CreateShaderParams struct {
	Description pgtype.Text
	UserID      uuid.UUID
}

func (q *Queries) CreateShader(ctx context.Context, arg CreateShaderParams) (Shader, error) {
	row := q.db.QueryRow(ctx, createShader, arg.Description, arg.UserID)
	var i Shader
	err := row.Scan(
		&i.ID,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getShader = `-- name: GetShader :one
SELECT id, description, user_id, created_at, updated_at FROM shaders
WHERE id = $1 LIMIT 1
`

func (q *Queries) GetShader(ctx context.Context, id uuid.UUID) (Shader, error) {
	row := q.db.QueryRow(ctx, getShader, id)
	var i Shader
	err := row.Scan(
		&i.ID,
		&i.Description,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const listShaders = `-- name: ListShaders :many
SELECT id, description, user_id, created_at, updated_at FROM shaders
ORDER BY id LIMIT $1 OFFSET $2
`

type ListShadersParams struct {
	Limit  int32
	Offset int32
}

func (q *Queries) ListShaders(ctx context.Context, arg ListShadersParams) ([]Shader, error) {
	rows, err := q.db.Query(ctx, listShaders, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Shader
	for rows.Next() {
		var i Shader
		if err := rows.Scan(
			&i.ID,
			&i.Description,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
