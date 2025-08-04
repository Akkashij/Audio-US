# discord-bot

# Discord Voice Recording Bot

## Giới thiệu

Bot này sử dụng **py-cord** để ghi âm giọng nói trong kênh thoại của Discord và lưu trữ tệp âm thanh. Nó hỗ trợ các lệnh để bắt đầu và dừng ghi âm, và có thể kết nối với model server qua HTTP hoặc WebSocket. ** (Chưa thực hiện được chia file)

## Cài đặt

1. **Clone dự án:**

   ```bash
   git clone https://github.com/your-repo/discord-recording-bot.git
   cd discord-recording-bot
   ```

2. **Tạo môi trường ảo (tuỳ chọn nhưng khuyến khích):**

   ```bash
   python -m venv venv
   source venv/bin/activate  # Trên macOS/Linux
   venv\Scripts\activate  # Trên Windows
   ```

3. **Cài đặt các thư viện cần thiết:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Tạo file **``** để lưu token của bot:**

   ```env
   DISCORD_BOT_TOKEN=your_token_here
   ```
5. **Tạo và sử dụng Ngrok:**
- Lấy tại ngrok.com.
- Thay "YOUR_NGROK_AUTH_TOKEN".

5. **Thay URL ở costum_pycord.py**
- Sau khi ngrok cung cấp URL thì thay api_url ở costum_pycord.py

## Chạy bot

```bash
python3 bot.py
```

## Các lệnh trong Discord

### 1. Bắt đầu ghi âm

Nhập lệnh trong Discord:

```bash
/record
```

- Bot sẽ tham gia kênh thoại mà bạn đang ở và bắt đầu ghi âm sử dụng WebSocket (mặc định).

Hoặc để chỉ định phương thức kết nối:

```bash
/record use_websocket:True  # Sử dụng WebSocket (mặc định)
/record use_websocket:False # Sử dụng HTTP
```

### 2. Dừng ghi âm

Nhập lệnh trong Discord:

```bash
/stop_recording
```

## Phương thức kết nối với Model Server

Bot này hỗ trợ hai phương thức kết nối:

### WebSocket (Khuyến nghị)
- **Hiệu quả hơn:** Duy trì một kết nối liên tục với server
- **Độ trễ thấp hơn:** Giảm thiểu overhead kết nối
- **Tiết kiệm băng thông:** Giảm đáng kể header request

### HTTP API (Legacy)
- **Tương thích ngược:** Vẫn hoạt động với cài đặt cũ
- **Đơn giản hơn:** Không cần quản lý trạng thái kết nối