@echo off
echo ===================================
echo   3D Plant Cell - Local Server
echo ===================================
echo.

:: Try Python (paling umum tersedia)
python --version >nul 2>&1
IF %ERRORLEVEL% == 0 (
    echo Menjalankan server dengan Python...
    echo Buka browser: http://localhost:8000
    echo Tekan Ctrl+C untuk berhenti.
    echo.
    python -m http.server 8000
    goto :end
)

:: Coba Python3
python3 --version >nul 2>&1
IF %ERRORLEVEL% == 0 (
    echo Menjalankan server dengan Python3...
    echo Buka browser: http://localhost:8000
    echo Tekan Ctrl+C untuk berhenti.
    echo.
    python3 -m http.server 8000
    goto :end
)

:: Coba Node.js / npx serve
npx --version >nul 2>&1
IF %ERRORLEVEL% == 0 (
    echo Menjalankan server dengan npx serve...
    echo Buka browser: http://localhost:3000
    echo Tekan Ctrl+C untuk berhenti.
    echo.
    npx serve .
    goto :end
)

echo [ERROR] Python atau Node.js tidak ditemukan!
echo Pasang salah satu:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
pause

:end
