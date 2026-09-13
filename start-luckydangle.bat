@echo off
:: Fully Detached Windows Launcher for Lucky Dangle
cd /d "%~dp0"
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0electron\main.cjs"
exit
