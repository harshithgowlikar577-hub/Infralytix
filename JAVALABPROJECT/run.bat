@echo off
echo ======================================================================
echo    Launching AI Placement Assessment Platform (MCQ Assessment Suite)
echo ======================================================================
if not exist "bin\main\Main.class" (
    echo [NOTICE] Binaries not found. Running compilation first...
    call compile.bat
)

java -cp bin main.Main
