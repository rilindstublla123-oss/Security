@echo off
echo Starte Arbeitszeit Tracker...
echo Bitte warten, der Webserver wird gestartet.

:: Starte den Vite Entwicklungs-Server
start npm run dev

:: Warte 3 Sekunden, damit der Server hochfahren kann
timeout /t 3 /nobreak > nul

:: Öffne den Browser mit der lokalen Adresse
start http://localhost:5173

echo.
echo Der Arbeitszeit Tracker wurde in Ihrem Standard-Browser geoeffnet.
echo Lassen Sie dieses schwarze Fenster offen, solange Sie das Programm nutzen.
echo.
pause
