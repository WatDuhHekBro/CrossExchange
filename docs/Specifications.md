# Structure
The top-level directory is reserved for files that have to be there for it to work as well as configuration files.
- `src`: Contains all the code for the bot itself. Code in this directory is for independent tasks keeping the initialization out of the subdirectories.
	- `core`: This is where core structures and critical functions for the bot go.
	- `modules`: This is where modules go that accomplish one specific purpose but isn't so necessary for the bot to function.
	- `commands`: Here's the place to store commands. The file name determines the command name.
- `dist`: This is where the runnable code in `src` compiles to. (The directory structure mirrors `src`.)
- `data`: Holds all the dynamic data used by the bot. This is what you modify if you want to change stuff for just your instance of the bot.
- `docs`: Used for information about the design of the project.

# Specific Files
This list starts from `src`/`dist`.
- `index`: This is the entry point of the bot. Here is where all the initialization is done, because the idea is to keep repeatable code in separate modules while having code that runs only once here designating this is **the** starting point.
- `setup`: Used for the first time the bot is loaded, walking the user through setting up the bot.
- `core/lib`: Exports a function object which lets you wrap values letting you call special functions as well as calling utility functions common to all commands.
- `core/storage`: Exports an object which handles everything related to files and templates.
- `core/command`: Contains the class used to instantiate commands.
- `core/wrappers`: Contains classes that wrap around values and provide extra functionality.
- `core/structures`: Contains all the structures that the dynamic data read from JSON files should follow. This exports an instance of a class since the class is just a specification as you instantiate it only duration loading of the JSON object.
- `modules/intercept`: A function called whenever a message event occurs letting you add additional events for certain messages in chat while moving this code away from the main file.
- `modules/stonks`: Manages all the calculations for the stonks feature.
- `modules/scheduler`: A custom scheduler managing random events with a semi-predictable time.

# Design Decisions
- All top-level files (relative to `src`/`dist`) should ideally be independent, one-time use scripts. This helps separate code that just initializes once and reusable code that forms the bulk of the main program itself. That's why all the file searching and loading commands/events will be done in `index`.
- Wrapper objects were designed with the idea of letting you assign functions directly to native objects [without the baggage of actually doing so](https://developer.mozilla.org/en-US/docs/Web/JavaScript/The_performance_hazards_of__%5B%5BPrototype%5D%5D_mutation).
- `test` should be a keyword for any file not tracked by git and generally be more flexible to play around with. It should also be automatically generated during initialization in `commands` so you can have templates ready for new commands.
- The storage module should not provide an auto-write feature. This would actually end up overcomplicating things especially when code isn't fully blocking.
- I think it's much easier to make a template system within the code itself. After all, the templates only change when the code changes to use new keys or remove old ones. You'll also be able to dedicate specific classes for the task rather than attaching meta tags to arrays and objects.
- I decided to forget about implementing dynamic events. I don't think it'll work with this setup. After all, there are only so many events you can use, whereas commands can have any number of ones, more suitable for dynamic loading. The main reasons were unsecure types and no easy way to access variables like the config or client.
- I want to make attaching subcommands more flexible, so you can either add subcommands in the constructor or by using a method. However, you have to add all other properties when instantiating a command.
- All commands should have only one parameter. This parameter is meant to be flexible so you can add properties without making a laundry list of parameters. It also has convenience functions too so you don't have to import the library for each command.
- The objects in `core/structures` are initialized into a special object once and then cached into memory automatically due to an import system. This means you don't have to keep loading JSON files over and over again even without the stack storage system. Because a JSON file resolves into an object, any extra keys are removed automatically (as it isn't initialized into the data) and any property that doesn't yet exist on the JSON object will be initialized into something. You can then have specific functions like `addUser` onto objects with a specific structure.