package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
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
		http.ServeFile(w, r, "test-websocket.html")
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
	})

	return r
}

func (app *application) run(
	r http.Handler,
) error {
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
