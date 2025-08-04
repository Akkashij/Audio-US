package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type Record struct {
	ID            int64
	UserID        int64
	UserName      string
	MeetingID     int64
	Text          string
	RecordedAt    time.Time
	EndRecordedAt time.Time
}

type RecordStorage struct {
	db *sql.DB
}

func (s *RecordStorage) GetByID(ctx context.Context, id int64) (*Record, error) {
	query := `
		SELECT id, user_id, user_name, meeting_id, text, recorded_at, end_recorded_at
		FROM records
		WHERE id = $1
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeOutDuration)
	defer cancel()

	var record Record
	err := s.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&record.ID,
		&record.UserID,
		&record.UserName,
		&record.MeetingID,
		&record.Text,
		&record.RecordedAt,
		&record.EndRecordedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &record, nil
}

func (s *RecordStorage) GetTextInMeeting(ctx context.Context, meetingID int64) ([]string, error) {
	query := `
		SELECT text
		FROM records
		WHERE meeting_id = $1
		ORDER BY recorded_at ASC
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeOutDuration)
	defer cancel()

	var texts []string
	rows, err := s.db.QueryContext(ctx, query, meetingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var text string
		if err := rows.Scan(&text); err != nil {
			return nil, err
		}
		texts = append(texts, text)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return texts, nil
}

func (s *RecordStorage) Create(ctx context.Context, record *Record) error {
	query := `
		INSERT INTO records (user_id, user_name, meeting_id, text, recorded_at, end_recorded_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	ctx, cancel := context.WithTimeout(ctx, QueryTimeOutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		record.UserID,
		record.UserName,
		record.MeetingID,
		record.Text,
		record.RecordedAt,
		record.EndRecordedAt,
	).Scan(&record.ID)

	if err != nil {
		return err
	}

	return nil
}
