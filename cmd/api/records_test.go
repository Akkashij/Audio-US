package main

import (
	"encoding/json"
	"testing"
	"time"
)

func createDummyRecordPayload() CreateRecordPayload {
	now := time.Now()
	return CreateRecordPayload{
		UserID:        1,
		UserName:      "Test User",
		MeetingID:     100,
		Text:          "This is a sample transcribed text",
		RecordedAt:    now,
		EndRecordedAt: now.Add(time.Minute * 5),
	}
}

func TestCreateRecordPayloadSerialization(t *testing.T) {
	dummy := createDummyRecordPayload()

	// Test JSON serialization
	jsonData, err := json.Marshal(dummy)
	if err != nil {
		t.Fatalf("Failed to marshal CreateRecordPayload: %v", err)
	}

	// Test JSON deserialization
	var decoded CreateRecordPayload
	if err := json.Unmarshal(jsonData, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal CreateRecordPayload: %v", err)
	}
}
