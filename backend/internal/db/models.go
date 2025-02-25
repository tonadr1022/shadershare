// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0

package db

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type Shader struct {
	ID            uuid.UUID
	Title         string
	Description   pgtype.Text
	UserID        uuid.UUID
	AccessLevel   int16
	PreviewImgUrl pgtype.Text
	CreatedAt     pgtype.Timestamptz
	UpdatedAt     pgtype.Timestamptz
}

type ShaderDetail struct {
	ID            uuid.UUID
	Title         string
	Description   pgtype.Text
	UserID        uuid.UUID
	AccessLevel   int16
	PreviewImgUrl pgtype.Text
	CreatedAt     pgtype.Timestamptz
	UpdatedAt     pgtype.Timestamptz
	Outputs       []byte
}

type ShaderDetailsWithUser struct {
	ID            uuid.UUID
	Title         string
	Description   pgtype.Text
	UserID        uuid.UUID
	AccessLevel   int16
	PreviewImgUrl pgtype.Text
	CreatedAt     pgtype.Timestamptz
	UpdatedAt     pgtype.Timestamptz
	Outputs       []byte
	Username      string
}

type ShaderInput struct {
	ID         uuid.UUID
	ShaderID   uuid.UUID
	OutputID   uuid.UUID
	Url        pgtype.Text
	Type       string
	Idx        int32
	Properties []byte
}

type ShaderOutput struct {
	ID       uuid.UUID
	ShaderID uuid.UUID
	Code     string
	Name     string
	Type     string
}

type ShaderWithUser struct {
	ID            uuid.UUID
	Title         string
	Description   pgtype.Text
	UserID        uuid.UUID
	AccessLevel   int16
	PreviewImgUrl pgtype.Text
	CreatedAt     pgtype.Timestamptz
	UpdatedAt     pgtype.Timestamptz
	Username      string
}

type User struct {
	ID        uuid.UUID
	Username  string
	Email     string
	AvatarUrl pgtype.Text
	CreatedAt pgtype.Timestamptz
	UpdatedAt pgtype.Timestamptz
}
