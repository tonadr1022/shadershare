package db

import (
	"shadershare/internal/e"

	"github.com/jackc/pgx/v5"
)

func TransformErrNoRows(err error) error {
	if err == pgx.ErrNoRows {
		return e.ErrNotFound
	}
	return err
}
