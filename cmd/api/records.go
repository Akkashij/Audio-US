package main

import (
	"net/http"
	"time"

	"github.com/thiendsu2303/audio-us-backend/internal/store"
)

type CreateRecordPayload struct {
	UserID        int64     `json:"user_id" validate:"required"`
	MeetingID     int64     `json:"meeting_id" validate:"required"`
	AudioID       int64     `json:"audio_id" validate:"required"`
	AudioCode     string    `json:"audio_code" validate:"required"`
	Text          string    `json:"text" validate:"required"`
	RecordedAt    time.Time `json:"recorded_at" validate:"required"`
	EndRecordedAt time.Time `json:"end_recorded_at" validate:"required"`
}

func (app *application) createRecordHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateRecordPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	record := &store.Record{
		Text:          payload.Text,
		AudioID:       payload.AudioID,
		AudioCode:     payload.AudioCode,
		RecordedAt:    payload.RecordedAt,
		EndRecordedAt: payload.EndRecordedAt,
		UserID:        payload.UserID,
		MeetingID:     payload.MeetingID,
	}

	ctx := r.Context()

	if err := app.store.Records.Create(ctx, record); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, record); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}
