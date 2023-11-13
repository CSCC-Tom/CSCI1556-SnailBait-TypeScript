rm -rf _compiled
echo "If anything is printed below, then Typescript-ESLint caught something, otherwise you're clean!"
npx eslint
echo "If anything is printed above, then Typescript-ESLint caught something, otherwise you're clean!"
./node_modules/.bin/tsc-watch --onSuccess "browserify _compiled/snailbait.js -o _compiled/bundle.js"