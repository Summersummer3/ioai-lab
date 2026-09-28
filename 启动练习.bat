@echo off
setlocal DisableDelayedExpansion
chcp 65001 >nul
pushd "%~dp0"
if errorlevel 1 goto folder_error
py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1
if not errorlevel 1 goto use_py
python -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1
if not errorlevel 1 goto use_python
echo Python 3.11 or newer is required.
echo Install Python from https://www.python.org/downloads/windows/
echo Enable "Add Python to PATH", then double-click this file again.
popd
pause
exit /b 1
:use_py
py -3 bootstrap.py
goto finished
:use_python
python bootstrap.py
goto finished
:finished
set "lab_exit=%errorlevel%"
popd
if not "%lab_exit%"=="0" pause
exit /b %lab_exit%
:folder_error
echo Cannot open this folder. Extract the full ZIP to a writable local folder.
pause
exit /b 1
