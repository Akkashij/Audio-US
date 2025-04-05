package main

import (
	"net/http"
	"strconv"
)

func (app *application) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	meetingIDStr := r.URL.Query().Get("meeting_id")
	if meetingIDStr == "" {
		http.Error(w, "Missing meeting_id parameter", http.StatusBadRequest)
		return
	}

	meetingID, err := strconv.ParseInt(meetingIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid meeting_id parameter", http.StatusBadRequest)
		return
	}

	app.hub.ServeWs(w, r, meetingID)
}
