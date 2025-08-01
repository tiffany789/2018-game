@echo off
echo 快速同步到 GitHub...
git add .
git commit -m "🔧 Fix mobile issues: Web-consistent score layout, audio button isolation, touch event scope"
git push
echo 同步完成！
pause
