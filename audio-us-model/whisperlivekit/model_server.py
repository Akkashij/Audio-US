import os
import numpy as np
import requests
import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from argparse import Namespace, ArgumentParser

# Import local modules from whisperlivekit
from whisperlivekit.whisper_streaming_custom.whisper_online import backend_factory, warmup_asr
from whisperlivekit.whisper_streaming_custom.online_asr import VACOnlineASRProcessor

# Define data models
class SegmentInfo(BaseModel):
    start_time: Optional[int] = None
    end_time: Optional[int] = None

class AudioChunk(BaseModel):
    audio: List[float]
    channel_id: Optional[int] = None
    user_name: Optional[str] = None
    ssrc_id: Optional[int] = None
    segment_infor: Optional[SegmentInfo] = None
    buffer_offset: int = 0
    isRecording: Optional[bool] = True

class ModelServer:
    def __init__(self, 
                 model_size=None, 
                 language=None, 
                 task=None,
                 backend=None,
                 buffer_trimming=None,
                 buffer_trimming_sec=None,
                 warmup_file=None,
                 model_cache_dir=None,
                 model_dir=None,
                 confidence_validation=None,
                 transcription=None,
                 min_chunk_size=None,
                 port=None,
                 host=None,
                 ssl_certfile=None,
                 ssl_keyfile=None,
                 log_level=None):
        
        # Get values from environment variables with fallback to defaults
        self.port = port or int(os.getenv("PORT", "6066"))
        self.host = host or os.getenv("HOST", "0.0.0.0")
        model_size = model_size or os.getenv("MODEL_SIZE", "medium")
        language = language or os.getenv("LANGUAGE", "en")
        task = task or os.getenv("TASK", "transcribe")
        backend = backend or os.getenv("BACKEND", "faster-whisper")
        buffer_trimming = buffer_trimming or os.getenv("BUFFER_TRIMMING", "segment")
        buffer_trimming_sec = buffer_trimming_sec or float(os.getenv("BUFFER_TRIMMING_SEC", "15"))
        confidence_validation = confidence_validation if confidence_validation is not None else os.getenv("CONFIDENCE_VALIDATION", "false").lower() == "true"
        transcription = transcription if transcription is not None else os.getenv("TRANSCRIPTION", "true").lower() == "true"
        min_chunk_size = min_chunk_size or float(os.getenv("MIN_CHUNK_SIZE", "0.5"))
        log_level = log_level or os.getenv("LOG_LEVEL", "INFO")
        
        # Save configuration
        self.port = port
        self.host = host
        self.warmup_file = warmup_file
        self.ssl_certfile = ssl_certfile
        self.ssl_keyfile = ssl_keyfile
        
        # Initialize FastAPI
        self.app = FastAPI()
        
        # Track active WebSocket connections
        self.active_connections = {}
        
        # Create args for the ASR model
        self.args = Namespace(
            backend=backend,
            model=model_size,
            lan=language,
            task=task,
            buffer_trimming=buffer_trimming,
            buffer_trimming_sec=buffer_trimming_sec,
            model_cache_dir=model_cache_dir,
            model_dir=model_dir,
            confidence_validation=confidence_validation,
            transcription=transcription,
            min_chunk_size=min_chunk_size,
            log_level=log_level
        )
        
        # Initialize ASR model
        self._setup_asr()
        self._setup_routes()
    
    def _setup_asr(self):
        """Initialize ASR model and tokenizer"""
        # Initialize ASR and tokenizer using backend_factory
        self.asr, self.tokenizer = backend_factory(self.args)
        
        # Warm up the model for faster first inference if warmup file is provided
        if self.warmup_file and os.path.exists(self.warmup_file):
            warmup_asr(self.asr, warmup_file=self.warmup_file)
        else:
            print("No warmup file provided or file does not exist.")
            warmup_asr(self.asr, warmup_file=None)
    
    def _setup_routes(self):
        """Set up FastAPI routes and WebSocket endpoints"""
        
        @self.app.get("/health")
        async def health_check():
            """Health check endpoint for Cloud Run"""
            return {"status": "healthy", "message": "Whisper ASR server is running"}
        
        @self.app.get("/")
        async def root():
            """Root endpoint with WebSocket information"""
            return {
                "message": "Whisper Live ASR Server", 
                "status": "running",
                "endpoints": {
                    "health": "/health",
                    "transcribe_http": "/transcribe",
                    "transcribe_websocket": "/ws/transcribe",
                    "docs": "/docs"
                },
                "websocket_usage": {
                    "url": "ws://your-domain/ws/transcribe",
                    "request_format": {
                        "audio": "List[float] - audio samples (required)",
                        'channel_id': "Optional[int] - channel identifier (default: None)",
                        "user_name": "Optional[str] - user identifier",
                        "ssrc_id": "Optional[int] - audio source ID", 
                        "segment_infor": "Optional[SegmentInfo] - segment timing info",
                        "buffer_offset": "int - buffer offset (default: 0)",
                        "isRecording": "Optional[bool] - recording status (default: true)"
                    },
                    "response_format": {
                        "transcription": "str - transcribed text",
                        "start": "float - start time in seconds",
                        "end": "float - end time in seconds", 
                        "channel_id": "Optional[int] - channel identifier",
                        "user_name": "Optional[str] - user identifier from request",
                        "ssrc_id": "Optional[int] - audio source ID from request"
                    }
                }
            }
        
        @self.app.post("/transcribe")
        async def transcribe_audio(chunk: AudioChunk):
            # Create a temporary processor for HTTP requests
            min_chunk_size = 1
            online_asr_proc = VACOnlineASRProcessor(
                min_chunk_size, 
                self.asr, 
                tokenize_method=self.tokenizer, 
                buffer_trimming=(self.args.buffer_trimming, self.args.buffer_trimming_sec)
            )
            online_asr_proc.init()
            
            # Convert list to numpy float32 array
            audio = np.array(chunk.audio, dtype=np.float32)

            # Process with VACOnlineASRProcessor
            online_asr_proc.insert_audio_chunk(audio, chunk.segment_infor, chunk.buffer_offset)
            result = online_asr_proc.process_iter()
            
            # Extract result information
            start = result.start
            end = result.end
            text = result.text
            
            # Print transcription to console
            if text:
                print(f"Transcription (user_name: {chunk.user_name}, ssrc_id: {chunk.ssrc_id}) (start: {start}) (end: {end}): {text}")
                
                # Send to BE server
                if chunk.ssrc_id and chunk.channel_id:
                    self.send_transcription_to_api(
                        text=text,
                        ssrc_id=chunk.ssrc_id,
                        user_name=chunk.user_name,
                        channel_id=chunk.channel_id,
                        start_time=start,
                        end_time=end
                    )


            return {
                "transcription": text,
                "start": start,
                "end": end,
                "channel_id": chunk.channel_id,
                "user_name": chunk.user_name,
                "ssrc_id": chunk.ssrc_id
            }
        
        @self.app.websocket("/ws/transcribe")
        async def websocket_endpoint(websocket: WebSocket):
            await websocket.accept()
            
            # Generate a unique client ID
            client_id = id(websocket)
            
            # Initialize online ASR processor for this client
            min_chunk_size = 1
            online_asr_proc = VACOnlineASRProcessor(
                min_chunk_size, 
                self.asr, 
                tokenize_method=self.tokenizer, 
                buffer_trimming=(self.args.buffer_trimming, self.args.buffer_trimming_sec)
            )
            online_asr_proc.init()
            
            # Store client info
            self.active_connections[client_id] = {
                "websocket": websocket,
                "asr_processor": online_asr_proc
            }
            
            print(f"Client {client_id} connected via WebSocket")
            
            try:
                while True:
                    # Receive JSON data from the client
                    data = await websocket.receive_json()
                    
                    # Convert to AudioChunk
                    audio_chunk = AudioChunk(**data)
                    
                    # Process the chunk
                    # Convert to numpy array
                    audio = np.array(audio_chunk.audio, dtype=np.float32)
                    
                    # Process audio with ASR
                    online_asr_proc.insert_audio_chunk(audio, audio_chunk.segment_infor, audio_chunk.buffer_offset)
                    result = online_asr_proc.process_iter()
                    
                    # Extract result information
                    start = result.start
                    end = result.end
                    text = result.text
                    
                    # Log transcription if there's text
                    if text:
                        print(f"WebSocket Transcription (user_name: {audio_chunk.user_name}, ssrc_id: {audio_chunk.ssrc_id}) (start: {start}) (end: {end}): {text}")
                        
                        # Send to BE server
                        if audio_chunk.ssrc_id and audio_chunk.channel_id:
                            self.send_transcription_to_api(
                                text=text,
                                ssrc_id=audio_chunk.ssrc_id,
                                user_name=audio_chunk.user_name,
                                channel_id=audio_chunk.channel_id,
                                start_time=start,
                                end_time=end,
                            )
                    
                    # Send back the transcription result
                    await websocket.send_json({
                        "transcription": text,
                        "start": start,
                        "end": end,
                        "channel_id": audio_chunk.channel_id,
                        "user_name": audio_chunk.user_name,
                        "ssrc_id": audio_chunk.ssrc_id
                    })
                    
            except WebSocketDisconnect:
                print(f"Client {client_id} disconnected")
                # Clean up
                if client_id in self.active_connections:
                    del self.active_connections[client_id]
            except Exception as e:
                print(f"Error handling websocket: {e}")
                if client_id in self.active_connections:
                    del self.active_connections[client_id]
    
    def start_server(self):
        """Start the FastAPI server"""
        # Start the server
        print(f"Starting server on {self.host}:{self.port}")
        
        # Check if SSL is enabled
        ssl_config = None
        if self.ssl_certfile and self.ssl_keyfile:
            ssl_config = {
                "ssl_keyfile": self.ssl_keyfile,
                "ssl_certfile": self.ssl_certfile
            }
            print("SSL enabled")
        
        # Run with or without SSL
        if ssl_config:
            uvicorn.run(self.app, host=self.host, port=self.port, **ssl_config)
        else:
            uvicorn.run(self.app, host=self.host, port=self.port)
    
    def send_transcription_to_api(self, text, ssrc_id, user_name, channel_id, start_time, end_time):
        """Send transcription data to external API endpoint"""
        if not text or not ssrc_id or not channel_id:
            return None
        
        # Convert start_time and end_time to ISO 8601 format strings
        iso_start_time = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
        iso_end_time = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
        
        # If we have actual timestamps, use them to create proper datetime objects
        if start_time is not None:
            # Create a datetime from the start_time (which is in seconds)
            base_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(seconds=end_time or 0)
            iso_start_time = (base_time + datetime.timedelta(seconds=start_time)).isoformat().replace("+00:00", "Z")
            
        if end_time is not None:
            # Create a datetime from the end_time (which is in seconds)
            iso_end_time = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")

        payload = {
            "user_id": ssrc_id,
            "user_name": user_name or "",
            "meeting_id": channel_id,
            "text": text,
            "recorded_at": iso_start_time,
            "end_recorded_at": iso_end_time
        }
        
        try:
            response = requests.post(
                "https://audio-us-backend-719882175475.asia-southeast1.run.app/v1/record",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"API Response: {response.status_code} - {response.text}")
            return response
        except Exception as e:
            print(f"Error sending to API: {e}")
            return None


def main():
    """Command line entry point"""
    parser = ArgumentParser(description="Run Whisper Live ASR server")
    
    # Server configuration
    parser.add_argument("--host", type=str, default="0.0.0.0", help="The host address to bind the server to")
    parser.add_argument("--port", type=int, default=6066, help="The port number to bind the server to")
    parser.add_argument("--ssl-certfile", type=str, help="Path to the SSL certificate file")
    parser.add_argument("--ssl-keyfile", type=str, help="Path to the SSL private key file")
    
    # Whisper model configuration
    parser.add_argument(
        "--model", 
        type=str, 
        default="medium", 
        help="Name size of the Whisper model to use (default: medium). Suggested values: tiny.en,tiny,base.en,base,small.en,small,medium.en,medium,large-v1,large-v2,large-v3,large,large-v3-turbo"
    )
    parser.add_argument(
        "--warmup-file", 
        type=str, 
        help="Audio file for model warmup. Improves first inference speed"
    )
    parser.add_argument(
        "--language", 
        "--lan", 
        type=str, 
        default="en", 
        help="Source language code, e.g. en,de,cs, or 'auto' for language detection"
    )
    parser.add_argument(
        "--task", 
        type=str, 
        default="transcribe", 
        choices=["transcribe", "translate"], 
        help="Transcribe or translate"
    )
    parser.add_argument(
        "--backend", 
        type=str, 
        default="faster-whisper", 
        choices=["faster-whisper", "whisper_timestamped", "mlx-whisper", "openai-api"], 
        help="Load only this backend for Whisper processing"
    )
    parser.add_argument(
        "--model-cache-dir", 
        type=str, 
        help="Overriding the default model cache dir where models downloaded from the hub are saved"
    )
    parser.add_argument(
        "--model-dir", 
        type=str, 
        help="Dir where Whisper model.bin and other files are saved. This option overrides --model parameter"
    )
    
    # Audio processing options
    parser.add_argument(
        "--min-chunk-size", 
        type=float, 
        default=0.5, 
        help="Minimum audio chunk size in seconds"
    )
    
    # Buffer handling and processing
    parser.add_argument(
        "--buffer-trimming", 
        type=str, 
        default="segment", 
        choices=["sentence", "segment"], 
        help="Buffer trimming strategy -- 'sentence' or 'segment'"
    )
    parser.add_argument(
        "--buffer-trimming-sec", 
        type=float, 
        default=15, 
        help="Buffer trimming length threshold in seconds"
    )
    
    # Advanced options
    parser.add_argument(
        "--confidence-validation", 
        action="store_true", 
        help="Accelerates validation of tokens using confidence scores"
    )
    parser.add_argument(
        "--no-transcription", 
        action="store_true", 
        help="Disable transcription to only see diarization results"
    )
    parser.add_argument(
        "--log-level", 
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], 
        default="INFO", 
        help="Set the log level"
    )
    
    args = parser.parse_args()
    
    # Process boolean flags
    transcription = not args.no_transcription
    
    # Create and start the server
    server = ModelServer(
        model_size=args.model,
        language=args.language,
        task=args.task,
        backend=args.backend,
        buffer_trimming=args.buffer_trimming,
        buffer_trimming_sec=args.buffer_trimming_sec,
        warmup_file=args.warmup_file,
        model_cache_dir=args.model_cache_dir,
        model_dir=args.model_dir,
        confidence_validation=args.confidence_validation,
        transcription=transcription,
        min_chunk_size=args.min_chunk_size,
        port=args.port,
        host=args.host,
        ssl_certfile=args.ssl_certfile,
        ssl_keyfile=args.ssl_keyfile,
        log_level=args.log_level
    )
    
    server.start_server()


if __name__ == "__main__":
    main()