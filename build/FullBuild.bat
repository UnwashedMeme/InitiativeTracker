del /q ..\release\*.*
call BuildScripts.bat
copy ..\dev\*.html ..\release\
copy ..\dev\*.php ..\release\
copy ..\dev\*.css ..\release\
copy ..\dev\*.gif ..\release\
copy ..\dev\*.bmp ..\release\
copy ..\dev\*.ico ..\release\
copy ..\dev\help\ ..\release
notepad Instructions.txt





