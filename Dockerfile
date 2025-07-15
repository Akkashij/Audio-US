# ---- Build stage ----
FROM golang:1.23 as builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main ./cmd/api

# ---- Run stage ----
FROM gcr.io/distroless/static-debian11
WORKDIR /app
COPY --from=builder /app/main /app/main
COPY --from=builder /app/cmd/migrate/migrations /app/cmd/migrate/migrations
EXPOSE 6065
HEALTHCHECK --interval=30s --timeout=3s CMD ["/app/main", "-healthcheck"]