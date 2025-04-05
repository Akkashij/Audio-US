include .envrc
MIGRATIONS_PATH := ./cmd/migrate/migrations

.PHONY: migrate-create
migration:
	@migrate create -seq -ext sql -dir $(MIGRATIONS_PATH) $(filter-out $@,$(MAKECMDGOALS))

.PHONY: migrate-up
migrate-up:
	@migrate -path=$(MIGRATIONS_PATH) -database=$(DB_ADDR) up

.PHONY: migrate-down
migrate-down:
	@migrate -path=$(MIGRATIONS_PATH) -database=$(DB_ADDR) down $(filter-out $@,$(MAKECMDGOALS))

.PHONY: docker-compose-up
up:
	@docker compose up -d

.PHONY: docker-compose-down
down:
	@docker compose down

.PHONY: seed
seed:
	@go run cmd/migrate/seed/main.go

.PHONY: test
test:
	@go test ./... -v

.PHONY: test-coverage
test-coverage:
	@go test ./... -v -cover
