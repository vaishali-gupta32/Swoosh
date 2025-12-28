@echo off
:loop
cls
echo Fetching your Public IP for Tunnel Password...
call node scripts/get_ip.js
timeout /t 2

echo.
echo Starting LocalTunnel (Best Short Domain: loca.lt)...
echo URL Request: swoosh-link.loca.lt
echo.

call npx localtunnel --port 3000 --subdomain swoosh-link

echo Tunnel crashed. Restarting...
goto loop
