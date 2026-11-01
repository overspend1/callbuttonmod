@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-windows.ps1" %*
set "installer_result=%errorlevel%"
pause
exit /b %installer_result%
