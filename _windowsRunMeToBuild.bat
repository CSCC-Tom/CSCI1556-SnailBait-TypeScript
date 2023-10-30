call del /s /f /q _compiled
call .\node_modules\.bin\tsc-watch --onSuccess ".\node_modules\.bin\browserify _compiled/snailbait.js -o _compiled/bundle.js"
pause
