import ctypes
import sys
import os
import eel
import subprocess
import threading
import tempfile
import shutil
import atexit
from pathlib import Path

# --- ЗАПРОС ПРАВ АДМИНИСТРАТОРА ---
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

if not is_admin():
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
    sys.exit()
# ---------------------------------

# Пути
if getattr(sys, 'frozen', False):
    base_path = Path(sys.executable).parent
    meipass = Path(sys._MEIPASS)
else:
    base_path = Path(__file__).parent
    meipass = base_path

web_path = base_path / 'web'
bat_folder = base_path / 'bat_files'

eel.init(str(web_path))

# Состояние
is_connected = False
current_profile = "Не выбран"
profiles = []

# Процессы
winws_process = None
tg_proxy_process = None
tg_temp_dir = None


# ========== ФУНКЦИИ ДЛЯ TELEGRAM ПРОКСИ ==========

def get_tg_proxy_source_path():
    if getattr(sys, 'frozen', False):
        return meipass / 'tg_proxy' / 'TgWsProxy_windows.exe'
    else:
        return base_path / 'tg_proxy' / 'TgWsProxy_windows.exe'

def start_tg_proxy():
    global tg_proxy_process, tg_temp_dir

    source_exe = get_tg_proxy_source_path()
    if not source_exe.exists():
        return False

    if getattr(sys, 'frozen', False):
        tg_temp_dir = tempfile.mkdtemp(prefix='zapret_tg_')
        target_exe = Path(tg_temp_dir) / 'TgWsProxy_windows.exe'
        shutil.copy2(str(source_exe), str(target_exe))
    else:
        target_exe = source_exe

    try:
        tg_proxy_process = subprocess.Popen(
            [str(target_exe)],
            creationflags=subprocess.CREATE_NO_WINDOW,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        return True
    except:
        return False

def stop_tg_proxy():
    global tg_proxy_process, tg_temp_dir

    if tg_proxy_process:
        try:
            tg_proxy_process.terminate()
        except:
            pass
        tg_proxy_process = None

    if tg_temp_dir:
        try:
            shutil.rmtree(tg_temp_dir, ignore_errors=True)
        except:
            pass
        tg_temp_dir = None

    return True

def get_tg_secret_from_config():
    import json
    appdata = os.environ.get('APPDATA', '')
    config_path = Path(appdata) / 'TgWsProxy' / 'config.json'

    if config_path.exists():
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            return config.get('secret', '')
        except:
            pass
    return ''


# ========== ФУНКЦИИ ДЛЯ ZAPRET ==========

def get_profiles_list():
    alts = []
    if bat_folder.exists():
        for file in sorted(bat_folder.glob("*.bat"), key=lambda x: x.name):
            if file.name.lower() != 'service.bat':
                alts.append(file.name)
    return alts

def run_winws():
    global winws_process

    bat_path = bat_folder / current_profile
    if not bat_path.exists():
        return False

    subprocess.run(['taskkill', '/f', '/im', 'winws.exe'], capture_output=True)

    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags = subprocess.STARTF_USESHOWWINDOW
    startupinfo.wShowWindow = 0

    winws_process = subprocess.Popen(
        [str(bat_path)],
        cwd=str(bat_folder),
        shell=True,
        creationflags=subprocess.CREATE_NO_WINDOW,
        startupinfo=startupinfo,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    return True

def stop_winws():
    global winws_process
    subprocess.run(['taskkill', '/f', '/im', 'winws.exe'], capture_output=True)
    if winws_process:
        try:
            winws_process.terminate()
        except:
            pass
        winws_process = None
    return True


# ========== EEL ЭКСПОРТЫ ==========

@eel.expose
def get_profiles():
    global profiles
    profiles = get_profiles_list()
    return profiles

@eel.expose
def get_current_profile():
    return current_profile

@eel.expose
def switch_profile(profile):
    global current_profile
    current_profile = profile
    return True

@eel.expose
def start_connection():
    global is_connected, current_profile

    if current_profile == "Не выбран" or not profiles:
        return {"success": False, "error": "Не выбран профиль"}

    if not run_winws():
        return {"success": False, "error": "Не удалось запустить Zapret"}

    start_tg_proxy()

    is_connected = True
    return {"success": True, "error": None}

@eel.expose
def stop_connection():
    global is_connected

    stop_winws()
    stop_tg_proxy()

    is_connected = False
    return {"success": True}

@eel.expose
def get_tg_proxy_link():
    secret = get_tg_secret_from_config()
    if secret:
        return f"tg://proxy?server=127.0.0.1&port=1443&secret=dd{secret}"
    return "tg://proxy?server=127.0.0.1&port=1443&secret=dd000000000000000000000000000000"

@eel.expose
def update_zapret():
    return True


# ========== ЗАПУСК ==========
if __name__ == '__main__':
    profiles = get_profiles_list()
    if profiles:
        current_profile = profiles[0]

    atexit.register(stop_tg_proxy)

    eel.start('index.html', size=(550, 650), port=0, mode='edge')