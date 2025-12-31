@echo off
setlocal ENABLEDELAYEDEXPANSION

echo ==============================
echo        GIT STATUS
echo ==============================
git status
echo.

REM Ask which file(s) to add
echo Which file(s) do you want to commit?
echo - Use a path (e.g. src/app.js)
echo - Or use . to add all changes
set /p FILES=Files to add: 

IF "%FILES%"=="" (
    echo No files specified. Aborting.
    goto :EOF
)

REM Ask for commit message
echo.
set /p MESSAGE=Why are you committing these changes? 

IF "%MESSAGE%"=="" (
    echo Commit message cannot be empty. Aborting.
    goto :EOF
)

echo.
echo ==============================
echo        GIT ADD
echo ==============================
git add %FILES%

IF ERRORLEVEL 1 (
    echo Error during git add. Aborting.
    goto :EOF
)

echo.
echo ==============================
echo       GIT COMMIT
echo ==============================
git commit -m "%MESSAGE%"

IF ERRORLEVEL 1 (
    echo Error during git commit. Aborting.
    goto :EOF
)

echo.
echo ==============================
echo        GIT PUSH
echo ==============================
git push

IF ERRORLEVEL 1 (
    echo Error during git push.
    goto :EOF
)

echo.
echo ✅ Done. Changes committed and pushed successfully.
pause