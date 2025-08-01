@echo off
echo 正在同步代码到 GitHub...
echo.

REM 添加所有修改的文件
git add .

REM 检查是否有修改
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo 没有检测到修改，无需同步。
    pause
    exit /b 0
)

REM 获取当前时间作为提交信息
for /f "tokens=1-4 delims=/ " %%i in ('date /t') do set mydate=%%i-%%j-%%k
for /f "tokens=1-2 delims=: " %%i in ('time /t') do set mytime=%%i:%%j
set datetime=%mydate% %mytime%

REM 提交修改
git commit -m "Auto sync: %datetime%"

REM 推送到 GitHub
git push

if %errorlevel% equ 0 (
    echo.
    echo ✅ 代码已成功同步到 GitHub！
) else (
    echo.
    echo ❌ 同步失败，请检查网络连接或 GitHub 设置。
)

echo.
pause
