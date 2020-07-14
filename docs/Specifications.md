# Structure
The top-level directory is reserved for files that have to be there for it to work as well as configuration files.
- `src`: Contains all the code for the bot itself. Code in this directory is for independent tasks keeping the initialization out of the subdirectories.
	- `core`: This is where core structures and critical functions for the bot go.
	- `modules`: This is where modules go that accomplish one specific purpose but isn't so necessary for the bot to function.
	- `commands`: Here's the place to store commands. The file name determines the command name.
	- `events`: Here's the place to store events. The file name determines the event type.
- `dist`: This is where the runnable code in `src` compiles to. (The directory structure mirrors `src`.)
- `data`: Holds all the dynamic data used by the bot. This is what you modify if you want to change stuff for just your instance of the bot.
- `assets`: Contains all the binary files.
- `docs`: Used for information about the design of the project.
- `tmp`: Reserved for the program itself. It's meant to hold any temporary data and it should only be active when it's being used.

# Specific Files
This list starts from `src`/`dist`.
- `index`: This is the entry point of the bot. Here is where all the initialization is done, because the idea is to keep repeatable code in separate modules while having code that runs only once here designating this is **the** starting point.
- `setup`: Used for the first time the bot is loaded, walking the user through setting up the bot.
- `core/lib`: Exports a function object which lets you wrap values letting you call special functions as well as calling utility functions common to all commands.
- `core/storage`: Exports an object which handles everything related to files and templates.
- `core/command`: Contains the class used to instantiate commands. Also contains a function which handles command recursion.
- `core/event`: Contains the class used to instantiate events.
- `core/wrappers`: Contains classes that wrap around values and provide extra functionality.
- `core/templates`: Contains all the structures that the dynamic data read from JSON files should follow.
- `modules/stonks`: Manages all the calculations for the stonks feature.
- `modules/scheduler`: A custom scheduler managing random events with a semi-predictable time.
- `events/message`: Initializes commands since all commands are based on a message's prefix.

# Design Decisions
- All top-level files (relative to `src`/`dist`) should ideally be independent, one-time use scripts. This helps separate code that just initializes once and reusable code that forms the bulk of the main program itself. That's why all the file searching and loading commands/events will be done in `index.ts`.
- Wrapper objects were designed with the idea of letting you assign functions directly to native objects [without the baggage of actually doing so](https://developer.mozilla.org/en-US/docs/Web/JavaScript/The_performance_hazards_of__%5B%5BPrototype%5D%5D_mutation).
- `test` should be a keyword for any file not tracked by git and generally be more flexible to play around with. It should also be automatically generated during initialization in `commands` so you can have templates ready for new commands.
- The storage module should not provide an auto-write feature. This would actually end up overcomplicating things especially when code isn't fully blocking.
- I think it's much easier to make a template system within the code itself. After all, the templates only change when the code changes to use new keys or remove old ones. You'll also be able to dedicate specific classes for the task rather than attaching meta tags to arrays and objects.

# The Storage Module
The storage module should have four public functions: `read`, `write`, `open`, and `close`, managing files and directories respectively.

Internally, dedicate a `stack` to the module as well, keeping track of serialized JSON data cached for efficiency. Also, have a synchronous read and an asynchronous write. The order only matters when waiting on a file to load.

The core ideas are as follows:
- Keep data in memory.
- Watch and reload the stack when data is manually modified. (`fs.watch`)
- Copy `templates` into `data`.
- Apply a template system.

But for now, I decided to just make it simpler. There won't be a stack, but the commands will be the same. Besides, is it going to kill your computer to keep serializing data every time?