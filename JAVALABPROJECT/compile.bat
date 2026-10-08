@echo off
echo ======================================================================
echo    AI Placement Assessment Platform - Compiling Java Files
echo ======================================================================
if not exist "bin" mkdir bin

javac -encoding UTF-8 -d bin src\util\*.java src\model\*.java src\service\*.java src\gui\*.java src\main\*.java src\test\*.java

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Compilation finished with 0 errors.
    echo Class files generated in bin\ directory.
) else (
    echo [ERROR] Compilation failed! Please inspect above errors.
)
pause
