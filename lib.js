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
	}
};