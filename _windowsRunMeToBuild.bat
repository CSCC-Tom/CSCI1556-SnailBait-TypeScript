call del /s /f /q _compiled
echo off
echo "If anything is printed below, then Typescript-ESLint caught something, otherwise you're clean!"
call npx eslint
echo "If anything is printed above, then Typescript-ESLint caught something, otherwise you're clean!"
echo on
pause
call .\node_modules\.bin\tsc-watch --onSuccess "npx eslint && .\node_modules\.bin\browserify _compiled/snailbait.js -o _compiled/bundle.js"
pause
