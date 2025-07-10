package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/thiendsu2303/audio-us-backend/internal/store"
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

func (app *application) discordCallbackHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		app.badRequestError(w, r, err)
		return
	}
	if req.Code == "" {
		app.badRequestError(w, r, fmt.Errorf("Missing code parameter"))
		return
	}

	discordTokenURL := "https://discord.com/api/oauth2/token"
	discordUserURL := "https://discord.com/api/users/@me"

	// Exchange code for access token
	tokenParams := url.Values{}
	tokenParams.Add("client_id", os.Getenv("DISCORD_CLIENT_ID"))
	tokenParams.Add("client_secret", os.Getenv("DISCORD_CLIENT_SECRET"))
	tokenParams.Add("grant_type", "authorization_code")
	tokenParams.Add("code", req.Code)
	tokenParams.Add("redirect_uri", os.Getenv("DISCORD_REDIRECT_URI"))

	tokenResp, err := http.PostForm(discordTokenURL, tokenParams)
	if err != nil {
		app.internalServerError(w, r, fmt.Errorf("Failed to exchange code for token: %w", err))
		return
	}
	defer tokenResp.Body.Close()

	var tokenData struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil {
		app.internalServerError(w, r, fmt.Errorf("Failed to parse token response: %w", err))
		return
	}

	// Get user info from Discord using Authorization header (Bearer token)
	reqUser, err := http.NewRequest("GET", discordUserURL, nil)
	if err != nil {
		app.internalServerError(w, r, fmt.Errorf("Failed to create user info request: %w", err))
		return
	}
	reqUser.Header.Set("Authorization", "Bearer "+tokenData.AccessToken)
	userInfoResp, err := http.DefaultClient.Do(reqUser)
	if err != nil {
		app.internalServerError(w, r, fmt.Errorf("Failed to get user info: %w", err))
		return
	}
	defer userInfoResp.Body.Close()

	var userData struct {
		ID       string `json:"id"`
		Email    string `json:"email"`
		Username string `json:"username"`
	}
	if err := json.NewDecoder(userInfoResp.Body).Decode(&userData); err != nil {
		app.internalServerError(w, r, fmt.Errorf("Failed to parse user data: %w", err))
		return
	}

	// Debug: log the Discord userData response
	fmt.Printf("Discord userData: %+v\n", userData)

	// Save user info to DB
	userInfo := &store.UserInfo{
		DiscordID: userData.ID,
		Email:     userData.Email,
		Username:  userData.Username,
	}
	if err := app.store.UserInfo.CreateOrUpdate(r.Context(), userInfo); err != nil {
		app.internalServerError(w, r, fmt.Errorf("Failed to save user info: %w", err))
		return
	}

	// Create JWT token
	claims := jwt.MapClaims{
		"user_id":  userData.ID,
		"email":    userData.Email,
		"username": userData.Username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		app.internalServerError(w, r, fmt.Errorf("Failed to create token: %w", err))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token": tokenString,
	})
}
