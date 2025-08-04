# Audio US Backend

A Go-based backend service for audio processing and management.

## Project Overview

This is a backend service built with Go that provides audio processing capabilities. It uses PostgreSQL as its database and includes WebSocket support for real-time communication.

## Prerequisites

- Go 1.23.2 or higher
- Docker and Docker Compose
- PostgreSQL 16.3 (optional if using Docker)

## Getting Started

### 1. Clone the Repository
```bash
git clone [repository-url]
cd audio-us-backend
```

### 2. Set Up Environment
The project uses direnv for environment management. Make sure you have direnv installed:
```bash
brew install direnv
```

### 3. Start Development Environment
The project uses Docker Compose for development. Start the services with:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5435)
- Backend service

### 4. Run Migrations
First, ensure you have the PostgreSQL driver installed:
```bash
go get github.com/lib/pq
```

Then run the migrations:
```bash
go run cmd/migrate/main.go up
```

### 5. Start the Application
```bash
go run cmd/api/main.go
```

## Project Structure

- `cmd/` - Main application entry points
  - `api/` - Main API service
  - `migrate/` - Database migrations
- `internal/` - Internal packages
- `web/` - Web-related components
- `bin/` - Binary executables

## Development

The project uses Go modules for dependency management. All dependencies are listed in [go.mod](cci:7://file:///Users/macos/ThienCode/audio-us-backend/go.mod:0:0-0:0).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[Add your license information here]

## Contact

[Add your contact information here]