package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	ErrNotFound          = errors.New("result not found")
	ErrConflict          = errors.New("duplicte key value violates unique constraint")
	QueryTimeOutDuration = 10 * time.Second
)

type Storage struct {
	Records interface {
		Create(context.Context, *Record) error
		GetByID(context.Context, int64) (*Record, error)
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Records: &RecordStorage{db: db},
	}
}
