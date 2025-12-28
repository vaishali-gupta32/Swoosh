@echo off
echo Launching Base62 URL Shortener...

:: Start Server in a new window with the loop script
start "Swoosh Server" cmd /c "launch_server.bat"

:: Wait a moment for server to warm up
timeout /t 2

:: Start Tunnel in a new window with the loop script
start "Public Tunnel" cmd /c "go_public.bat"

echo.
echo ========================================================
echo  App is running in two new windows!
echo  DO NOT CLOSE THEM. Minimize them if you want.
echo ========================================================
echo.
pause
