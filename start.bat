@echo off
title Open Data Explorer - Full Stack Web Application
echo ======================================================================
echo          OPEN DATA EXPLORER - FULL STACK COLLEGE PROJECT
echo ======================================================================
echo.
echo Starting Backend API Server (Port 5000)...
start "Open Data Explorer - Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Waiting 3 seconds for database initialization...
timeout /t 3 /nobreak >nul

echo Starting Frontend Web Portal (Port 5173)...
start "Open Data Explorer - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo  Servers launched! Opening your browser at http://localhost:5173 ...
echo ======================================================================
timeout /t 2 /nobreak >nul
start http://localhost:5173
