const fs = require('fs');

// Change it to load JSON files without typing a file name over and over again. Instead of let stonks = lib.readJSON('stonks'), do something like lib.loadJSON('stonks') then access it by doing lib.stack.stonks. Have it auto-write as well when making changes, also iterate over keys and only write what's not already there.
module.exports = {
	readJSON(file, template = {})
	{
		const path = `data/${file}.json`;
		
		if(!fs.existsSync(path))
		{
			fs.writeFileSync(path, JSON.stringify(template));
			return template;
		}
		else
		{
			let data;
			
			try
			{
				data = JSON.parse(fs.readFileSync(path));
			}
			catch(error)
			{
				console.error(error);
				data = {};
			}
			
			return data;
		}
	},
	writeJSON(file, data = {})
	{
		const path = `data/${file}.json`;
		const existed = fs.existsSync(path);
		fs.writeFileSync(path, JSON.stringify(data));
		return existed;
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