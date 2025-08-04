# audio-us-model

## Hướng dẫn tạo file cài đặt và shortcut khởi động bot (hiện terminal)

1. **Đóng gói file Python thành .exe (hiện terminal)**
   - Cài đặt PyInstaller:
     ```
     pip install pyinstaller
     ```
   - Đóng gói:
     ```
     pyinstaller --onefile --console your_script.py
     ```
   - File `.exe` sẽ nằm trong thư mục `dist`.

2. **Tạo file cài đặt và shortcut**
   - Tải và cài đặt [Inno Setup](https://jrsoftware.org/isinfo.php).
   - Tạo script mới với nội dung ví dụ:
     ```
     [Setup]
     AppName=audio-us-model
     AppVersion=1.0
     DefaultDirName={pf}\audio-us-model

     [Files]
     Source: "dist\your_script.exe"; DestDir: "{app}"; Flags: ignoreversion

     [Icons]
     Name: "{group}\audio-us-model (Terminal)"; Filename: "{app}\your_script.exe"
     Name: "{commondesktop}\audio-us-model (Terminal)"; Filename: "{app}\your_script.exe"
     ```
   - Compile để tạo file cài đặt `.exe` (ví dụ: `audio-us-model-setup.exe`).
   - Ngoài Inno Setup, bạn có thể sử dụng các công cụ khác như:
     - **NSIS (Nullsoft Scriptable Install System):** https://nsis.sourceforge.io/
     - **Advanced Installer:** https://www.advancedinstaller.com/
     - **WiX Toolset:** https://wixtoolset.org/
     - **InstallForge:** https://installforge.net/
   - Các công cụ này đều hỗ trợ tạo file cài đặt và shortcut cho ứng dụng Windows.
   - Quy trình sử dụng tương tự: chỉ định file `.exe` đã đóng gói, cấu hình đường dẫn cài đặt và shortcut, sau đó build ra file cài đặt `.exe`.

   - Ví dụ với NSIS, bạn có thể dùng script đơn giản:
     ```
     OutFile "audio-us-model-setup.exe"
     InstallDir "$PROGRAMFILES\audio-us-model"
     Page directory
     Page instfiles

     Section ""
       SetOutPath "$INSTDIR"
       File "dist\your_script.exe"
       CreateShortCut "$DESKTOP\audio-us-model (Terminal).lnk" "$INSTDIR\your_script.exe"
     SectionEnd
     ```

3. **Cài đặt và sử dụng**
   - Gửi file cài đặt vừa tạo cho người dùng (KHÔNG gửi file `.exe` trong thư mục `dist`).
   - Người dùng chỉ cần chạy file cài đặt, sau đó có thể click vào biểu tượng trên Desktop hoặc Start Menu để mở terminal và khởi động bot.

> **Tại sao không gửi file `.exe` trong `dist`?**  
> File `.exe` trong `dist` chỉ là file thực thi chính, có thể thiếu các thư viện/phụ thuộc hoặc file phụ cần thiết cho chương trình.  
> File cài đặt tạo bằng Inno Setup sẽ đóng gói đầy đủ và tự động tạo shortcut, giúp người dùng cài đặt và sử dụng dễ dàng hơn.
> Có thể thay đổi tên hoặc icon shortcut bằng cách chỉnh sửa phần `[Icons]` trong script Inno Setup.

