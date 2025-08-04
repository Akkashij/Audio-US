import threading
import numpy as np
import select 
import librosa 
from discord.sinks import RawData, RecordingException
from discord.voice_client import VoiceClient
from discord import opus, guild
import requests
import websockets
import json
import asyncio
import os
from dotenv import load_dotenv


# Default local server URL when not using ngrok - use localhost instead of 0.0.0.0 for client connections


class CustomVoiceClient(VoiceClient):
    
    def unpack_audio(self, data):
        self.is_silence = False

        if 200 <= data[1] <= 204:
            # RTCP received.
            return None, None
        if self.paused:
            return None, None

        data = RawData(data, self)

        if data.decrypted_data == b"\xf8\xff\xfe":  # Frame of silence
            self.is_silence =True
            return None, None
    
        data_decode = self.decoder.decode(data.decrypted_data) # len(data_decode) = 3840 at 48kHz <=> 20ms
        ssrc_id = data.ssrc
        if data_decode is None:
            return ssrc_id, None
        
        # Convert from stereo to mono and resample from 48kHz to 16kHz
        # Convert buffer to numpy array
        pcm_array = np.frombuffer(data_decode, dtype=np.int16)

        # Convert stereo to mono by averaging channels
        pcm_mono = np.mean(pcm_array.reshape(-1, 2), axis=1).astype(np.float32) / 32768.0
        pcm_resampled = librosa.resample(pcm_mono, orig_sr=48000, target_sr=16000)
        return ssrc_id, pcm_resampled 
    
    
    def recv_decoded_audio(self, data: RawData):
        pass


    def insert_buffer_tuple(self, ssrc, segment, segment_info):
        self.tuple_buffer.append((ssrc, segment, segment_info))
        
    def receive_audio_chunk(self):
        PACKET_SIZE = 32000*5*60
        out = []
        minlimit = self.min_chunk_size * self.SAMPLING_RATE
        previous_out = 0
        count_consecutive_silence = 0 # number of consecutive silence frames
        count_silence = 0   # total silence frames in one while loop
        segment_info = None
        len_out = 0 # used to store length when ssrc changes

        if self.temp_audio_chunk is not None:
            out.append(self.temp_audio_chunk)
            self.temp_audio_chunk = None
            len_out = sum(len(x) for x in out)
            self.current_samples += len_out
            self.speaker = self.temp_speaker

        while (len_out + previous_out) < minlimit:
            ready, _, err = select.select([self.socket], [], [self.socket], 0.01)
            if not ready:
                if err:
                    print(f"Socket error: {err}")
                continue
            
            try:
                #raw_bytes = self.socket.recv(PACKET_SIZE)
                raw_bytes = self.socket.recv(4096)
            except OSError as e:
                # print("loi OSError",e, flush=True)
                #self.stop_recording()
                # raw_bytes = None
                continue

            ssrc_id, data_float_32 = self.unpack_audio(raw_bytes)

            if self.is_silence == True:
                count_consecutive_silence += 1 
                count_silence += 1 
                self.current_samples += 320 
                len_out += 320

            if count_consecutive_silence >= 25: 
                break

            # Handle speaker change when there is no silence between two speakers
            if self.speaker is not None and ssrc_id is not None and self.speaker != ssrc_id:
                self.temp_audio_chunk = data_float_32
                self.temp_speaker = ssrc_id
                self.speaker_changed= True
                break 
                
            if data_float_32 is None:
                continue
            
            # Case: data_float_32 is not None
            self.speaker = ssrc_id # silence -> continue
            out.append(data_float_32)
            len_out += len(data_float_32)
            self.current_samples += 320
            count_consecutive_silence = 0 # Handle cases with interleaved silence and sound
        
        # if not out: 
        #     return None
        if (len(out) != 0 ): 
            conc = np.concatenate(out)

            if self.is_first and len(conc) < minlimit:
                self.is_first = False
            else:
                if self.speaker_changed == True:
                    if self.triggered == False: 
                        time_start = self.current_samples -count_silence - len(conc)
                        time_end = self.current_samples 
                        segment_info = {
                            "start_time": time_start,
                            "end_time": time_end
                        }
                    elif self.triggered == True:
                        time_end = self.current_samples
                        self.triggered = False
                        segment_info = {
                            "start_time": None,
                            "end_time": time_end
                        }
                    self.speaker_changed = False
                else: # # Handle behavior: speaker must talk for at least 1 second to be considered meaningful; otherwise, pass
                    if count_consecutive_silence >= 25 and self.triggered == False:
                        time_start = self.current_samples -count_silence - len(conc)
                        time_end = self.current_samples - 320 * 10
                        segment_info = {
                            "start_time": time_start,
                            "end_time": time_end
                        }
                    elif self.triggered == False: # non voice > 0.5 + voice 
                        time_start = self.current_samples - len(conc)- count_silence
                        self.triggered = True
                        segment_info = {
                            "start_time": time_start,
                            "end_time": None
                        }
                    # otherwise, if voice has already started and new voice continues, no need to return start, just return end
                    elif count_consecutive_silence >= 25 and self.triggered == True:
                        time_end = self.current_samples - 320 * 10
                        self.triggered = False
                        segment_info = {
                            "start_time": None,
                            "end_time": time_end
                        }
                # default segment_info = None

                self.insert_buffer_tuple(self.speaker, conc, segment_info)

        if count_consecutive_silence  >= 25: # # Return None when silence is detected
            self.speaker = None

    def get_user_id_from_ssrc(self, ctx, ssrc):
        user_id = self.ws.ssrc_map[ssrc]["user_id"]
        user_name = str(ctx.guild.get_member(user_id))
        user_alias = user_name.split("(")[1].split(")")[0]
        return str(user_alias)
    
    async def post_audio_data_ws(self, websocket, audio_samples, user_name, segment_info, buffer_offset, isRecording, ssrc):
        """Send audio data via WebSocket"""
        try:
            if isRecording:
                audio_list = audio_samples.tolist()
            else:
                audio_list = None

            if user_name == self.author_name:
                ssrc = self.author_id
            
            payload = {
                "audio": audio_list,
                "channel_id": self.channel_id,
                "user_name": user_name,
                "ssrc_id": ssrc,
                "segment_infor": segment_info,
                "buffer_offset": buffer_offset,
                "isRecording" : isRecording
            }
            
            # Send audio data via WebSocket
            await websocket.send(json.dumps(payload))
            
            response = await websocket.recv()
            response_data = json.loads(response)
            
            # if "transcription" in response_data and response_data["transcription"]:
            #     print(f"Transcription (WebSocket): {response_data['transcription']}", flush=True)
            
            return response_data
        except Exception as e:
            print(f"Error in post_audio_data_ws: {e}", flush=True)
            raise e
    
    def post_audio_data(self, api_url, audio_samples, user_name, segment_info, buffer_offset, isRecording, ssrc):
        """Legacy HTTP POST method (giữ lại cho tương thích ngược)"""
        if isRecording:
            audio_list = audio_samples.tolist()
        else:
            audio_list = None

        if user_name == self.author_name:
            ssrc = self.author_id

        response = requests.post(
            api_url,
            json={
                "audio": audio_list,
                "channel_id": self.channel_id,
                "user_name": user_name,
                "ssrc_id": ssrc, 
                "segment_infor": segment_info,
                "buffer_offset": buffer_offset,
                "isRecording" : isRecording
            }   
        )
        
        # Check if the response is successful
        return response.json() if response.status_code == 200 else None
    
    def recv_audio(self, *args):
        self.tuple_buffer = [] 
        self.audio_buffer = []
        
        # Try to read ngrok URL, fallback to local URL if not available
        url = self.url_ngrok.strip() if self.url_ngrok else None
        if not url or self.USE_HOST:  # Empty file or forced to use localhost
            url = self.api_sever_url   
        # print(f"Using URL: {url}", flush=True)

        
        if self.use_websocket:
            # Change URL from HTTP to WebSocket
            if url.startswith('https://'):
                ws_url = f"{url.replace('https://', 'wss://')}/ws/transcribe"
            elif url.startswith('http://'):
                ws_url = f"{url.replace('http://', 'ws://')}/ws/transcribe"
            else:
                # If no protocol specified, assume http for local development
                ws_url = f"ws://{url}/ws/transcribe"
            
            print(f"Attempting WebSocket connection to: {ws_url}", flush=True)
            
            # Test server health first
            try:
                if url.startswith('http'):
                    health_url = f"{url}/health"
                    health_response = requests.get(health_url, timeout=5)
                    print(f"Health check response: {health_response.status_code}", flush=True)
                else:
                    print("Skipping health check for non-HTTP URL", flush=True)
            except Exception as health_error:
                print(f"Health check failed: {health_error}", flush=True)
            
            # Create a dedicated event loop for WebSocket
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # WebSocket processing coroutine
            async def process_audio_with_websocket():
                try:
                    # Add timeout to WebSocket connection (15 seconds)
                    async with websockets.connect(ws_url, open_timeout=15, close_timeout=15) as websocket:
                        #print(f"Connected to WebSocket server at {ws_url}", flush=True)
                        
                        while self.recording:
                            self.receive_audio_chunk()
                            
                            if self.tuple_buffer:
                                # print("len(tuple_buffer): ", len(self.tuple_buffer), flush=True)
                                
                                first_tuple = self.tuple_buffer[0]
                                ssrc_id, conc, inf = first_tuple
                                user_name = self.get_user_id_from_ssrc(self.ctx, ssrc_id)
                                self.tuple_buffer = []
                                
                                # Send audio data via WebSocket
                                await self.post_audio_data_ws(websocket, conc, user_name, inf, self.buffer_offset, self.recording, ssrc_id)
                                self.buffer_offset = self.current_samples
                        user_name = self.get_user_id_from_ssrc(self.ctx, self.speaker)
                        await self.post_audio_data_ws(websocket, None, user_name, None, self.buffer_offset, self.recording, ssrc_id)
                except Exception as ws_conn_error:
                    print(f"WebSocket connection error: {ws_conn_error}", flush=True)
                    # Fall back to HTTP mode if WebSocket fails
                    self.use_websocket = False
                    print("Falling back to HTTP mode due to WebSocket connection failure", flush=True)
            
            # Run the WebSocket processing coroutine
            try:
                loop.run_until_complete(process_audio_with_websocket())
            except Exception as e:
                print(f"WebSocket error: {e}", flush=True)
                # Fall back to HTTP mode
                self.use_websocket = False
                print("Falling back to HTTP mode after WebSocket error", flush=True)
                
                # Notify user about the fallback
                try:
                    asyncio.run_coroutine_threadsafe(
                        self.ctx.followup.send("⚠️ WebSocket connection failed. Switched to HTTP mode."), 
                        self.ctx.bot.loop
                    )
                except Exception as notify_error:
                    print(f"Could not notify user about WebSocket fallback: {notify_error}", flush=True)
            finally:
                loop.close()
        else:
            # Use HTTP API as fallback
            api_url = f"{url}/transcribe"
            while self.recording:
                self.receive_audio_chunk()

                if self.tuple_buffer:
                    
                    first_tuple = self.tuple_buffer[0]
                    ssrc_id, conc, inf = first_tuple
                    user_name = self.get_user_id_from_ssrc(self.ctx, ssrc_id)
                    self.tuple_buffer = []
                    self.post_audio_data(api_url, conc, user_name, inf, self.buffer_offset, self.recording, ssrc_id)
                    self.buffer_offset = self.current_samples

            user_name = self.get_user_id_from_ssrc(self.ctx, self.speaker)
            self.post_audio_data(api_url, None, user_name, None, self.buffer_offset, self.recording, ssrc_id)

    def start_recording(self, *args, ctx, sync_start: bool = True, use_websocket: bool = True, SAVED_NGROK_URL_PATH: str = None, USE_HOST, API_SERVER_URL: str = None, channel_id: int = None, author_id: int = None, author_name: str = None):
        if not self.is_connected():
            raise RecordingException("Not connected to voice channel.")
        if self.recording:
            raise RecordingException("Already recording.")
        

        self.empty_socket()
        self.api_sever_url = API_SERVER_URL
        self.ctx= ctx
        self.author_id = author_id
        self.author_name = author_name
        self.channel_id = channel_id
        self.url_ngrok = SAVED_NGROK_URL_PATH
        self.USE_HOST = USE_HOST
        self.SAMPLING_RATE = 16000
        self.min_chunk_size = 0.5
        self.tuple_buffer = []
        self.current_samples = 0  # samples from start to stop
        self.use_websocket = use_websocket
        self.originally_websocket = use_websocket  # Track if we started with WebSocket
        self.buffer_offset = 0
        self.decoder = opus.Decoder()
        self.recording = True
        self.is_first = True 
        self.triggered = False #True: voice, False: non-voice
        self.speaker_changed = False
        self.speaker = None # None: new sentence; ssrc_id: current speaker
        self.temp_audio_chunk = None # temporarily stores audio when changing speakers
        self.temp_speaker = None # temporarily stores speaker ID during switch
        self.sync_start = sync_start

        t = threading.Thread(
            target=self.recv_audio,
            args=(
                *args,
            ),
        )
        t.start()

    def stop_recording(self):
        """Stops the recording.
        Must be already recording.

        .. versionadded:: 2.0

        Raises
        ------
        RecordingException
            Not currently recording.
        """
        if not self.recording:
            raise RecordingException("Not currently recording audio.")
        self.recording = False
        self.paused = False
