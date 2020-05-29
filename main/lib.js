const fs = require('fs');
const init = require('./init.json');

// Change it to load JSON files without typing a file name over and over again. Instead of let stonks = lib.readJSON('stonks'), do something like lib.loadJSON('stonks') then access it by doing lib.stack.stonks. Have it auto-write as well when making changes, also iterate over keys and only write what's not already there.
// I think all these synchronous functions are good in my case actually, I want to make sure that the file loads before doing anything else.
// init: lib.readJSON('stonks');
// call into script: let stonks = lib.loadJSON('stonks'); // do not use lib.stack.stonks, it won't auto-write
// get/add key: let value = lib.get(stonks.markets, 'shadoon', {});
module.exports = {
	stack: {},
	write: [],
	// Load a JSON file into memory so you don't have to parse it every time. Here's where you also use init.json.
	// Reorganize + add keys that don't exist.
	readJSON(header)
	{
		const path = `data/${header}.json`;
		let data;
		
		//console.log(header in this.stack, !fs.existsSync(path));
		
		if(header in this.stack)
			data = this.stack[header];
		else if(!fs.existsSync(path))
		{
			data = init[header] || {};
			this.writeJSON(header, data);
		}
		else
		{
			try
			{
				data = JSON.parse(fs.readFileSync(path));
			}
			catch(error)
			{
				console.error(error);
				data = {};
			}
		}
		
		return data;
	},
	writeJSON(header, data = {})
	{
		//const path = `data/${header}.json`;
		//const existed = fs.existsSync(path);
		//fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
		//return existed;
		
		// Space out the JSON this one time (config.json). Or maybe have it be a toggle?
		fs.writeFileSync(`data/${header}.json`, JSON.stringify(data, null, '\t'));
	},
	loadJSON(header, readOnly = false)
	{
		if(!readOnly)
			this.write.push(header);
		return this.readJSON(header);
	},
	loadStack()
	{
		for(const file of fs.readdirSync('data').filter(file => file.endsWith('.json')))
			this.stack[file.substring(0, file.lastIndexOf('.json'))] = this.readJSON(file.substring(0, file.indexOf('.json')));
		
		//console.log(this.stack);
	},
	writeStack()
	{
		//console.log(this.write, this.stack);
		for(let header of this.write)
			this.writeJSON(header, this.stack[header]);
		this.write = []; // Potential memory leak?
		//console.log(this.stack);
	},
	get(object, key, template)
	{
		if(object[key] === undefined)
			object[key] = template;
		return object[key];
	},
	mkdir(path)
	{
		if(!fs.existsSync(path))
			fs.mkdirSync(path);
	},
	// Random Number, min included, max excluded
	rand(min, max)
	{
		return (Math.random() * (max - min)) + min;
	},
	// Random Integer Inclusive
	randInt(min, max)
	{
		return Math.floor((Math.random() * (max - min + 1)) + min);
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
	pluralise(number, word, plural = '', singular = '')
	{
		return number === 1 ? word + singular : word + plural;
	}
};