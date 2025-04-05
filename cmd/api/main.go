package main

import (
	"log"

	_ "github.com/lib/pq" // postgres driver
	"github.com/thiendsu2303/audio-us-backend/internal/db"
	"github.com/thiendsu2303/audio-us-backend/internal/env"
	"github.com/thiendsu2303/audio-us-backend/internal/store"
	"github.com/thiendsu2303/audio-us-backend/internal/websocket"
)

const version = "0.0.1"

func main() {
	cfg := config{
		addr: env.GetString("ADDR", ":6065"),
		db: dbConfig{
			addr:         env.GetString("DB_ADDR", "postgres://adminaudioai:audious@localhost:5435/audioai?sslmode=disable"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", "15m"),
		},
		env: env.GetString("ENV", "development"),
	}

	db, err := db.New(
		cfg.db.addr,
		cfg.db.maxOpenConns,
		cfg.db.maxIdleConns,
		cfg.db.maxIdleTime,
	)
	if err != nil {
		log.Panic(err)
	}

	defer db.Close()
	log.Println("Database connection established")

	store := store.NewStorage(db)

	hub := websocket.NewHub()
	go hub.Run()

	app := &application{
		config: cfg,
		store:  store,
		hub:    hub,
	}

	mux := app.mount()
	log.Fatal(app.run(mux))
}
