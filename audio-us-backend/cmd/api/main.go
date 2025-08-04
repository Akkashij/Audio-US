package main

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // postgres driver
	"github.com/thiendsu2303/audio-us-backend/internal/db"
	"github.com/thiendsu2303/audio-us-backend/internal/store"
	"github.com/thiendsu2303/audio-us-backend/internal/websocket"
)

const version = "0.0.1"

func getenvIntWithDefault(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	n, err := strconv.Atoi(val)
	if err != nil {
		return fallback
	}
	return n
}

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Use PORT environment variable (required for Cloud Run)
	// Default to ADDR env var or ":6065" if neither is set
	var addr string
	if port := os.Getenv("PORT"); port != "" {
		addr = ":" + port
		log.Printf("Using PORT environment variable: %s", addr)
	} else if envAddr := os.Getenv("ADDR"); envAddr != "" {
		addr = envAddr
		log.Printf("Using ADDR environment variable: %s", addr)
	} else {
		addr = ":6065"
		log.Printf("No PORT or ADDR specified, defaulting to %s", addr)
	}

	cfg := config{
		addr: addr,

		db: dbConfig{
			addr:         os.Getenv("DB_ADDR"),
			maxOpenConns: getenvIntWithDefault("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: getenvIntWithDefault("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime:  os.Getenv("DB_MAX_IDLE_TIME"),
		},
		env: os.Getenv("ENV"),
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
