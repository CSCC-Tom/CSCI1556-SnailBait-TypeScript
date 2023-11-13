# SnailBait-TypeScript
David Geary's SnailBait made for Core HTML5 2D Game Programming, but in TypeScript, converted chapter-by-chapter.

Original: https://github.com/David-Geary/SnailBait

This project uses tsc to compile the project and browserify to consolidate the modules into a single .js file for the HTML. 

It requires NodeJS (https://nodejs.org/en) to be installed on your machine; if you then run the InstallDependencies and RunMeToBuild scripts (or manually execute the commands by command-line), it will transpile the TypeScript to JavaScript and the index.html will then display the Snail Bait game if you open it in a web browser.

MAC INSTRUCTIONS: Use a terminal instance to run the .sh files. You can't run them directly. (Also on Mac, this project will install `browserify` globally.)