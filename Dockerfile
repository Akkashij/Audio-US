FROM python:3.10-slim

# Install system libraries required for audio processing and Discord bot
RUN apt-get update && apt-get install -y \
    libopus-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code into the container
COPY . .

# Set basic environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port for Cloud Run
EXPOSE 8080

# Run the bot
CMD ["python", "discord_recording_bot/bot.py"]