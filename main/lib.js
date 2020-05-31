const fs = require('fs');
const init = require('./init.json');

// It might actually be a good idea to make a loader function for lib.js then go from there as if you loaded the code. Currently, it's quite messy, especially with += and such.

// In a command file...
// Call into your script: let stonks = lib.loadJSON('stonks'); // do not use lib.stack.stonks, it won't auto-write
// Get key and add it if it's missing: let value = lib.get(stonks.markets, 'shadoon', {});
module.exports = {
	// I think all these synchronous functions are good in my case actually, I want to make sure that the file loads before doing anything else.
	// The plan is to load JSON files into a cache-like system, and write when necessary (but don't do unnecessary loading).
	// lib.readJSON and lib.writeJSON will be simply that, reading and writing JSON files. Leave the rest to other functions.
	// Read a JSON file. If it exists, check with the template and add any missing keys. If it doesn't exist, check if there's a template, and if not, write an empty object into it then return that.
	// Templating only adds keys. If you want to update your values to whatever's in init.json, delete your data.
	readJSON(header)
	{
		const path = `data/${header}.json`;
		let data;
		
		if(!fs.existsSync(path))
		{
			data = init[header] || {};
			this.writeJSON(header, data);
		}
		else
		{
			try
			{
				data = JSON.parse(fs.readFileSync(path));
				
				// Base these searches off of the template rather than the data file itself.
				if(init[header])
				{
					this.addKeysR(data, init[header]);
					this.writeJSON(header, data);
				}
			}
			catch(error)
			{
				console.error(error);
				data = {};
			}
		}
		
		return data;
	},
	// Recursive function specifically for adding keys based on the templates.
	// Enter an object and its template, doesn't return anything as it modifies the object you send in.
	addKeysR(data, template)
	{
		for(let key in template)
		{
			let value = template[key];
			
			// For objects and arrays, if the key doesn't exist in the first place, then you're going to be cloning the object anyways.
			if(!(key in data))
				data[key] = value;
			// These cases below are only if the object actually exists, then modify only that.
			else if(value && value.constructor === Object)
				this.addKeysR(data[key], value);
			// As for arrays, there's no easy way to clone them as they're based off index rather than key. In that case, deal with it later. :leaSMUG:
			/*else if(value && value.constructor === Array)
			{
				
			}*/
		}
	},
	writeJSON(header, data)
	{
		if(!data)
		{
			console.warn("Warning: The JSON header " + header + " is being written without any value!");
			data = {};
		}
		
		fs.writeFileSync(`data/${header}.json`, JSON.stringify(data, null, '\t'));
	},
	// Load a JSON file into a command. If it exists in the stack, load it, otherwise, attempt to read a file. "readOnly" determines whether or not any changes are saved.
	loadJSON(header, readOnly = false)
	{
		let data;
		
		if(header in this.stack)
			data = this.stack[header];
		else
		{
			data = this.readJSON(header);
			this.stack[header] = data;
		}
		
		if(!readOnly)
			this.write.push(header);
		
		return data;
	},
	// Used during initialization. Initialize all pre-existing JSON files.
	loadStack()
	{
		this.stack = {};
		this.write = [];
		let files = this.searchDirectory('data', file => file.endsWith('.json'));
		
		for(let file of files)
		{
			let header = file.substring(0, file.lastIndexOf('.json'));
			this.stack[header] = this.readJSON(header);
		}
	},
	// Used after every command to automatically write changed data. That data will be cached for efficiency.
	writeStack()
	{
		for(let header of this.write)
			this.writeJSON(header, this.stack[header]);
		this.write = []; // Potential memory leak?
	},
	// Gets an object and initializes it to something if it doesn't exist.
	get(object, key, template)
	{
		if(!(key in object))
			object[key] = template;
		return object[key];
	},
	// Create directory only if it doesn't exist.
	createDirectory(path)
	{
		if(!fs.existsSync(path))
			fs.mkdirSync(path);
	},
	/**
	Create the directory if it doesn't exist, then gather a list of all files in it with an optional filter.
	@param - Path to folder excluding/starting at the root.
	@return - An array of all the non-folder file names.
	**/
	searchDirectory(path, filter)
	{
		this.createDirectory(path);
		let dir = fs.readdirSync(path);
		
		if(filter)
			dir = dir.filter(filter);
		
		return dir;
	},
	// Random Number, min included, max excluded
	rand(min, max)
	{
		return (Math.random() * (max - min)) + min;
	},
	// Random Integer (Exclusive)
	randInt(min, max)
	{
		return Math.floor((Math.random() * (max - min)) + min);
	},
	randSign(num = 1)
	{
		return num * (Math.random() < 0.5 ? -1 : 1);
	},
	randDeviation(base, deviation)
	{
		return this.rand(base - deviation, base + deviation);
	},
	// e.g. pluralise(5, 'credit', 's') and pluralise(5, 'part', 'ies', 'y'). You can just have two fields as well if you're entering something like pluralise(5, 'sheep') while looping through the data.
	pluraliseExclude(number, word, plural = '', singular = '')
	{
		return number === 1 ? word + singular : word + plural;
	},
	// A separate function to include the number with pluralization to avoid redundancy.
	pluralise(number, word, plural = '', singular = '')
	{
		return number + ' ' + this.pluraliseExclude(number, word, plural, singular);
	}
};