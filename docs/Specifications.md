# Structure
The top-level directory is reserved for files that have to be there for it to work as well as configuration files.
- `src`: Contains all the code for the bot itself. Code in this directory is for independent tasks keeping the initialization out of the subdirectories.
	- `core`: This is where core structures and critical functions for the bot go.
	- `modules`: This is where modules go that accomplish one specific purpose but isn't so necessary for the bot to function.
	- `commands`: Here's the place to store commands. The file name determines the command name.
	- `events`: Here's the place to store events. The file name determines the event type.
- `dist`: This is where the runnable code in `src` compiles to. (The directory structure mirrors `src`.)
- `templates`: Initializes static data into `data` implicitly taking into account subtemplates.
- `data`: Holds all the dynamic data used by the bot. This is what you modify if you want to change stuff for just your instance of the bot. (The directory structure mirrors `templates`.)
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
- `core/structures`: Contains reusable and more abstract structures. This also contains all the structures that more accurately detail the dynamic data that's read from JSON files.
- `modules/stonks`: Manages all the calculations for the stonks feature.
- `modules/scheduler`: A custom scheduler managing random events with a semi-predictable time.

# Design Decisions
- All top-level files (relative to `src`/`dist`) should ideally be independent, one-time use scripts. This helps separate code that just initializes once and reusable code that forms the bulk of the main program itself. That's why all the file searching and loading commands/events will be done in `index.ts`.
- Wrapper objects were designed with the idea of letting you assign functions directly to native objects [without the baggage of actually doing so](https://developer.mozilla.org/en-US/docs/Web/JavaScript/The_performance_hazards_of__%5B%5BPrototype%5D%5D_mutation).
- `test` should be a keyword for any file not tracked by git and generally be more flexible to play around with. It should also be automatically generated during initialization in `commands` so you can have templates ready for new commands.

# Templates
One of the problems when creating a template system is: How do you deal with dynamic data and make subtemplates? It's easy enough to make a template for just a couple of key-value pairs, but what happens when you want a list of users to contain the same keys?
- One solution is to use subtemplates in a separate location, but I decided not to use that since I think it'd be harder to navigate compared to...
- Using meta tags describing how the rest of the data is supposed to look like.

If you wanted to describe a subtemplate for an array of objects, you'd dedicate the first index to the base and the rest of the array to the actual data you want to initialize.
```json
[
	{
		"city": "",
		"weather": 0,
		"rainfall": 0,
		"raining": false,
		"rank": 0
	},
	{
		"city": "London",
		"raining": true
	}
]
```

If you wanted to describe a subtemplate for a list of key-value pairs, you'd dedicate a `__meta__` key to describe how the rest of the data is supposed to look like.
```json
{
	"__meta__":
	{
		"weather": 0,
		"rainfall": 0,
		"raining": false,
		"rank": 0
	},
	"london":
	{
		"raining": true
	}
}
```