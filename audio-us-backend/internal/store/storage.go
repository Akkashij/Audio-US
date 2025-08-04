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

// UserInfo represents a user from Discord
type UserInfo struct {
	ID        int64
	DiscordID string
	Email     string
	Username  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// UserInfoStorage handles user_info table operations
type UserInfoStorage struct {
	db *sql.DB
}

type Storage struct {
	Records interface {
		Create(context.Context, *Record) error
		GetByID(context.Context, int64) (*Record, error)
		GetTextInMeeting(context.Context, int64) ([]string, error)
	}
	UserInfo interface {
		CreateOrUpdate(context.Context, *UserInfo) error
		GetByDiscordID(context.Context, string) (*UserInfo, error)
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Records:  &RecordStorage{db: db},
		UserInfo: &UserInfoStorage{db: db},
	}
}

func (s *UserInfoStorage) CreateOrUpdate(ctx context.Context, user *UserInfo) error {
	query := `
		INSERT INTO user_info (discord_id, email, username, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		ON CONFLICT (discord_id) DO UPDATE SET
			email = EXCLUDED.email,
			username = EXCLUDED.username,
			updated_at = NOW()
		RETURNING id, created_at, updated_at
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeOutDuration)
	defer cancel()
	return s.db.QueryRowContext(ctx, query, user.DiscordID, user.Email, user.Username).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (s *UserInfoStorage) GetByDiscordID(ctx context.Context, discordID string) (*UserInfo, error) {
	query := `
		SELECT id, discord_id, email, username, created_at, updated_at
		FROM user_info
		WHERE discord_id = $1
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeOutDuration)
	defer cancel()
	var user UserInfo
	err := s.db.QueryRowContext(ctx, query, discordID).Scan(
		&user.ID,
		&user.DiscordID,
		&user.Email,
		&user.Username,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &user, nil
}
