@echo off
echo 快速同步到 GitHub...
git add .
git commit -m "🔧 Fix mobile issues: tile-grid size matching, horizontal layout, centering, voice synthesis"
git push
echo 同步完成！
pause
