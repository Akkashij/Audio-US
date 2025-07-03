package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	discordAuthURL = "https://discord.com/api/oauth2/authorize"
	discordTokenURL = "https://discord.com/api/oauth2/token"
	discordUserURL  = "https://discord.com/api/users/@me"
)

type DiscordConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	State        string
}

type DiscordAuthHandler struct {
	config DiscordConfig
	secret string
}

func NewDiscordAuthHandler(clientID, clientSecret, redirectURI, secret string) *DiscordAuthHandler {
	return &DiscordAuthHandler{
		config: DiscordConfig{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURI:  redirectURI,
			State:        "random-state-string", // In production, this should be a secure random string
		},
		secret: secret,
	}
}

func (h *DiscordAuthHandler) GetLoginURL() string {
	params := url.Values{}
	params.Add("client_id", h.config.ClientID)
	params.Add("redirect_uri", h.config.RedirectURI)
	params.Add("response_type", "code")
	params.Add("scope", "identify email")
	params.Add("state", h.config.State)

	return fmt.Sprintf("%s?%s", discordAuthURL, params.Encode())
}

func (h *DiscordAuthHandler) HandleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.FormValue("code")
	if code == "" {
		http.Error(w, "Missing code parameter", http.StatusBadRequest)
		return
	}

	// Exchange code for access token
	tokenParams := url.Values{}
	tokenParams.Add("client_id", h.config.ClientID)
	tokenParams.Add("client_secret", h.config.ClientSecret)
	tokenParams.Add("grant_type", "authorization_code")
	tokenParams.Add("code", code)
	tokenParams.Add("redirect_uri", h.config.RedirectURI)

	tokenResp, err := http.PostForm(discordTokenURL, tokenParams)
	if err != nil {
		http.Error(w, "Failed to exchange code for token", http.StatusInternalServerError)
		return
	}
	defer tokenResp.Body.Close()

	var tokenData struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil {
		http.Error(w, "Failed to parse token response", http.StatusInternalServerError)
		return
	}

	// Get user info
	userInfoResp, err := http.Get(fmt.Sprintf("%s?access_token=%s", discordUserURL, tokenData.AccessToken))
	if err != nil {
		http.Error(w, "Failed to get user info", http.StatusInternalServerError)
		return
	}
	defer userInfoResp.Body.Close()

	var userData struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Username string `json:"username"`
	}
	if err := json.NewDecoder(userInfoResp.Body).Decode(&userData); err != nil {
		http.Error(w, "Failed to parse user data", http.StatusInternalServerError)
		return
	}

	// Create JWT token
	claims := jwt.MapClaims{
		"user_id":    userData.ID,
		"email":      userData.Email,
		"username":   userData.Username,
		"exp":        time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(h.secret))
	if err != nil {
		http.Error(w, "Failed to create token", http.StatusInternalServerError)
		return
	}

	// Return token
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token": tokenString,
	})
}
