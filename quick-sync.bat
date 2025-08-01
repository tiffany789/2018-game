@echo off
echo 快速同步到 GitHub...
git add .
git commit -m "🎨 Mobile UI fixes: Web-consistent layout, audio button state, larger tile fonts"
git push
echo 同步完成！
pause
