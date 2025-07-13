package main

import (
	"net/http"
	"time"

	"github.com/thiendsu2303/audio-us-backend/internal/store"
)

type CreateRecordPayload struct {
	UserID        int64     `json:"user_id" validate:"required"`
	UserName      string    `json:"user_name" validate:"required"`
	MeetingID     int64     `json:"meeting_id" validate:"required"`
	Text          string    `json:"text" validate:"required"`
	RecordedAt    time.Time `json:"recorded_at" validate:"required"`
	EndRecordedAt time.Time `json:"end_recorded_at" validate:"required"`
}

type EndMeetingPayload struct {
	UserID    int64 `json:"user_id"`
	MeetingID int64 `json:"meeting_id" validate:"required"`
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
		RecordedAt:    payload.RecordedAt,
		EndRecordedAt: payload.EndRecordedAt,
		UserID:        payload.UserID,
		UserName:      payload.UserName,
		MeetingID:     payload.MeetingID,
	}

	ctx := r.Context()

	if err := app.store.Records.Create(ctx, record); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Broadcast the new record to WebSocket clients in the same meeting
	app.hub.BroadcastToMeeting(record.MeetingID, record)

	if err := app.jsonResponse(w, http.StatusCreated, record); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) endMeetingHandler(w http.ResponseWriter, r *http.Request) {
	var payload EndMeetingPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	meetingID := payload.MeetingID
	userID := payload.UserID

	ctx := r.Context()

	texts, err := app.store.Records.GetTextInMeeting(ctx, meetingID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Return all records for the meeting, including user_id and meeting_id
	if err := app.jsonResponse(w, http.StatusOK, map[string]interface{}{
		"user_id":    userID,
		"meeting_id": meetingID,
		"texts":      texts,
	}); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}
