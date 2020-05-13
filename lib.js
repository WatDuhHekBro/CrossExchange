const fs = require('fs');

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
	}
};