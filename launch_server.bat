@echo off
:loop
echo Starting Swoosh Server...
call npm run start
echo Server stopped! Restarting in 3 seconds...
timeout /t 3
goto loop
