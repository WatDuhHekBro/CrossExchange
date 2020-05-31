# The Structure of the Project
I've sectioned off the files of the bot into different directories for organization.
- The top-level directory contains files that are mostly non-optional because they have to be there specifically in order to work.
- The `main` directory contains the main script `index.js` which then calls other essential parts of the code like the library, `lib.js`, and the list of templates, `init.json`.
- The `commands` directory contains the list of top-level commands, and the name you use to call that command is exactly the file name. Meaning `commands/stonks.js` would be called as `$stonks`. Its subcommands are in a recursive structure in that file.
- The `data` directory contains all of your configuration/storage files and is completely ignored by git. All user-generated data will be stored there and so you don't need to move any files around to avoid committing those types of files.
- The `docs` directory contains all of the information about the design decisions of this bot, the structure, and certain features of the bot.

# The Structure of a Command File
Each command file is defined by a single `module.exports = {}` command. To make way for subcommands without having a bunch of else ifs, command files use a recursive structure.
- At the top level, you can have a `description` string, a `common` object which you can access from any subcommand, and the keys of a command level.
- For each command level, you can have a `run` function which is the command that runs at that level alone with no further arguments, and which has one parameter sent down which is an object containing all sorts of stuff like the library, message, channel, etc. You can also override `run` with a single message, a `message` string. Then you can also have subcommand nodes, of which there are three.
- The three subcommand nodes are a `subcommands` object, a `number` object, and an `any` object, and they're in the order that they're executed.
	- The `subcommands` object has a list of key:value pairs determining the subcommand word and the command structure that follows. This is the only node that excludes its parameter, as you wouldn't need it since it's in the name.
	- The `number` object will be used if it's defined and as the name suggests, is called if the next argument is a number. If you want to use it as an integer, use `Math.floor()`.
	- The `any` object will be used if it's defined and the other two cases don't appear.