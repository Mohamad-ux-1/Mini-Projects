@echo off

:: تشغيل سيرفر لارافيل في نافذة مخفية (أو مصغرة)
cd /d "C:\Users\LOQ\Desktop\Back\back"
start /min cmd /c "php artisan serve"

:: تشغيل سيرفر رياكت في نافذة أخرى (والذي سيفتح المتصفح تلقائياً)
cd /d "C:\Users\LOQ\Desktop\dashboard_project2"
start /min cmd /c "npm run dev"

npx json-server --watch db.json --port 3000
exit
