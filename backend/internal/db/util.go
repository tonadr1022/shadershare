package db

import (
	"shadershare/internal/e"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func TransformErrNoRows(err error) error {
	if err == pgx.ErrNoRows {
		return e.ErrNotFound
	}
	return err
}

func ToPgTypeText(s string) pgtype.Text {
	if s == "" {
		return pgtype.Text{}
	}
	return pgtype.Text{String: s, Valid: true}
}
