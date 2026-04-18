@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py run_local_server.py
  goto :eof
)
python run_local_server.py
