@echo off
echo Iniciando servidor ms_negocios...
cd /d %~dp0
python manage.py runserver 8002
pause

