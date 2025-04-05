package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/thiendsu2303/audio-us-backend/internal/store"
)

type recordKey string

const recordCtx recordKey = "record"

type CreateRecordPayload struct {
	Text string `json:"text" validate:"required"`
}

func (app *application) recordsContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idParam := chi.URLParam(r, "recordID")
		id, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}
		ctx := r.Context()

		record, err := app.store.Records.GetByID(ctx, id)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				app.notFoundResponse(w, r, err)
				return
			default:
				app.internalServerError(w, r, err)
				return
			}
		}

		ctx = context.WithValue(ctx, recordCtx, record)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func getRecordFromCtx(r *http.Request) *store.Record {
	ctx := r.Context()
	record, _ := ctx.Value(recordCtx).(*store.Record)
	return record
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
		Text:   payload.Text,
		UserID: 1,
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
