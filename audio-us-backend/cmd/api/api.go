package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/thiendsu2303/audio-us-backend/internal/auth"
	"github.com/thiendsu2303/audio-us-backend/internal/store"
	"github.com/thiendsu2303/audio-us-backend/internal/websocket"
)

type application struct {
	config config
	store  store.Storage
	hub    *websocket.Hub
}

type config struct {
	addr string
	db   dbConfig
	env  string
}

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

func (app *application) mount() http.Handler {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/test", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "web/websocket.html")
	})

	r.Route("/v1", func(r chi.Router) {

		r.Get("/health", app.healthCheck)
		r.Get("/ws", app.handleWebSocket)

		r.Route("/record", func(r chi.Router) {
			r.Post("/", app.createRecordHandler)
		})

		r.Route("/ping/end-meeting", func(r chi.Router) {
			r.Post("/", app.endMeetingHandler)
		})

		r.Route("/auth", func(r chi.Router) {
			// Create Discord auth handler
			discordHandler := auth.NewDiscordAuthHandler(
				os.Getenv("DISCORD_CLIENT_ID"),
				os.Getenv("DISCORD_CLIENT_SECRET"),
				os.Getenv("DISCORD_REDIRECT_URI"),
				os.Getenv("JWT_SECRET"),
			)

			r.Get("/login", func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(map[string]string{
					"login_url": discordHandler.GetLoginURL(),
				})
			})

			r.Post("/callback", app.discordCallbackHandler)
		})
	})

	return r
}

func (app *application) run(
	r http.Handler,
) error {
	if app.config.addr == "" {
		app.config.addr = ":6065"
		log.Printf("WARNING: Empty server address, defaulting to %s", app.config.addr)
	}

	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      r,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  10 * time.Second,
		IdleTimeout:  time.Minute,
	}

	log.Printf("Starting server on %s", app.config.addr)

	return srv.ListenAndServe()
}
