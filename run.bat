@echo off
REM Adept Intranet Batch Runner
REM This provides a simple way to run PowerShell commands

if "%1"=="" (
    powershell -ExecutionPolicy Bypass -File "%~dp0run.ps1" help
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0run.ps1" %*
)









