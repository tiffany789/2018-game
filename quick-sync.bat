@echo off
echo 快速同步到 GitHub...
git add .
git commit -m "Update: %date% %time%"
git push
echo 同步完成！
pause
