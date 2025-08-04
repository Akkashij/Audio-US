"""
Entry point for the WhisperLiveKit audio model server.
This script uses command-line arguments to configure the model server,
making it suitable for Docker and cloud deployments.
"""
from whisperlivekit.model_server import main

if __name__ == "__main__":
    # Use the argument parser defined in model_server.py
    # This allows for configuration via environment variables or command-line args
    # which is ideal for Docker and cloud deployment
    main()