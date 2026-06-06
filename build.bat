@echo off
cd /d C:\Users\korya\Desktop\Python\MyZapret
echo Installing dependencies...
python -m pip install pyinstaller eel bottle --quiet
echo Building...
python -m PyInstaller --onefile --windowed --name Zapret --add-data "web;web" --add-data "bat_files;bat_files" --add-data "tg_proxy;tg_proxy" --hidden-import eel main.py
if exist dist\Zapret.exe (
    echo SUCCESS! File: dist\Zapret.exe
    start dist\Zapret.exe
) else (
    echo FAILED!
)
pause