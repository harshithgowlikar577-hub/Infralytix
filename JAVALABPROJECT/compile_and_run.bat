@echo off
echo ======================================================================
echo    AI Placement Assessment Platform - One-Click Build and Launch
echo ======================================================================
if not exist bin mkdir bin
echo Compiling Java source packages...
javac -encoding UTF-8 -d bin src\util\*.java src\model\*.java src\service\*.java src\gui\*.java src\main\*.java src\test\*.java
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b %ERRORLEVEL%
)
echo [SUCCESS] Compilation completed successfully!
echo Launching Application...
java -cp bin main.Main
