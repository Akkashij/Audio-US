# Makefile for audio-us-model project

.PHONY: build up down logs

# Commandes de base pour Docker Compose
build:
	@echo "🔨 Building Docker image..."
	docker compose build

up:
	@echo "🚀 Starting container..."
	docker compose up -d

down:
	@echo "🛑 Stopping container..."
	docker compose down

logs:
	@echo "📋 Showing logs..."
	docker compose logs -f
