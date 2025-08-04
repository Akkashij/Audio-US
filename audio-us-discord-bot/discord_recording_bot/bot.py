import discord
import os
from dotenv import load_dotenv
from typing import Final
try:
    from .custom_pycord import *
except ImportError:
    from custom_pycord import *
import sys
import threading
import http.server
import socketserver


if getattr(sys, 'frozen', False):
    # Running from a PyInstaller .exe file
    base_path = os.path.dirname(sys.executable)
    env_path = os.path.join(base_path, "config", ".env")
else:
    # Running from Python script
    base_path = os.path.dirname(__file__)
    env_path = os.path.join(os.path.dirname(__file__), "../config/.env")

load_dotenv(env_path)
TOKEN: Final[str] = os.getenv('DISCORD_BOT_TOKEN')
SAVED_NGROK_URL_PATH: Final[str] = os.getenv('NGROK_TOKEN')
USE_HOST: Final[str] = os.getenv("USE_HOST", "True").lower() in ("true", "1", "t", "yes", "y")
API_SERVER_URL: Final[str] = os.getenv("API_SERVER_URL", "http://0.0.0.0:6066")
PORT: Final[int] = int(os.getenv("PORT", "8080"))

# Initialize the bot
bot = discord.Bot(intents=discord.Intents.all())  
connections = {}

def simple_hash(text: str) -> int:
    return abs(hash(text)) % 1_000_000

@bot.command()
async def record(ctx, use_websocket: bool = True):
    """Command to start recording, with WebSocket option"""
    # Immediately defer the response to prevent "Unknown interaction" error
    await ctx.defer()
    
    voice = ctx.author.voice

    if not voice:
        await ctx.followup.send("You aren't in a voice channel!")
        return
    
    author_name = ctx.author.name
    author_id = simple_hash(author_name)

    # print(f"User id: {author_id}")
    # print(f"Mã cuộc họp của bạn là: {voice.channel.id}")
    await ctx.followup.send(f"Meeting ID: {voice.channel.id}")
    await ctx.followup.send(f"User ID: {author_id}")

    method = "WebSocket" if use_websocket else "HTTP"
    await ctx.followup.send(f"Starting recording using {method} connection...")

    vc = await voice.channel.connect(cls=CustomVoiceClient)
    connections.update({ctx.guild.id: vc})  # Store voice client in cache
    vc.start_recording(ctx=ctx, use_websocket=use_websocket, SAVED_NGROK_URL_PATH=SAVED_NGROK_URL_PATH, USE_HOST=USE_HOST, API_SERVER_URL=API_SERVER_URL, channel_id=voice.channel.id, author_id=author_id, author_name=author_name) 
    
    await ctx.followup.send("Recording started successfully!")

@bot.command()
async def stop_recording(ctx):
    # Immediately defer the response to prevent "Unknown interaction" error
    await ctx.defer()
    
    if ctx.guild.id in connections:   # Check if guild is in cache
        vc = connections[ctx.guild.id]
        vc.stop_recording()
        await vc.disconnect()
        del connections[ctx.guild.id]  # Remove guild from cache
        await ctx.followup.send("Stopped recording!")
    else:
        await ctx.followup.send("I am currently not recording here.")

@bot.command()
async def shutdown(ctx):
    await ctx.defer()
    await ctx.followup.send("Bot is shutting down...")
    await bot.close()

def print_usage_guide():
    print("=" * 60)
    print("🤖 DISCORD RECORDING BOT - Hướng dẫn sử dụng")
    print("1. Mở Discord và tham gia phòng thoại.")
    print("2. Dùng lệnh: /record để bắt đầu ghi âm.")
    print("3. Dùng lệnh: /stop_recording để kết thúc ghi âm.")
    print("4. Dùng lệnh: /shutdown để tắt bot.")
    print("💡 Mọi lệnh đều được dùng trong khung chat Discord.")
    print("=" * 60)

print_usage_guide()

# Create a simple HTTP server for health checks
class HealthCheckHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b'Discord Bot is running!')
    
    def log_message(self, format, *args):
        # Silence HTTP server logs
        pass

def start_http_server():
    handler = HealthCheckHandler
    httpd = socketserver.TCPServer(("", PORT), handler)
    print(f"Starting HTTP server at port {PORT}")
    httpd.serve_forever()

# Chỉ chạy bot khi file này được execute trực tiếp, không phải khi được import
if __name__ == "__main__":
    # Start HTTP server in a separate thread
    server_thread = threading.Thread(target=start_http_server, daemon=True)
    server_thread.start()
    print(f"HTTP server running on port {PORT}")
    
    # Run the Discord bot
    bot.run(token=TOKEN)
