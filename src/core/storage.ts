import fs from "fs";
import lib from "./lib";

//const stack: {[key: string]: object} = {};

const Storage = {
	read(header: string): object
	{
		//if(header in stack)
			//return stack[header];
		
		this.open("data");
		const path = `data/${header}.json`;
		let data = {};
		
		if(fs.existsSync(path))
		{
			const file = fs.readFileSync(path, "utf-8");
			
			try
			{
				data = JSON.parse(file);
			}
			catch(error)
			{
				lib.warn(`Malformed JSON data (header: ${header}), backing it up.`);
				fs.writeFileSync(`${path}.backup`, file);
			}
		}
		
		//stack[header] = data;
		return data;
	},
	write(header: string, data: object)
	{
		this.open("data");
		const path = `data/${header}.json`;
		//const result = (header in stack) ? JSON.stringify(stack[header], null, '\t') : "{}";
		fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
	},
	open(path: string, filter?: (value: string, index: number, array: string[]) => unknown): string[]
	{
		if(!fs.existsSync(path))
			fs.mkdirSync(path);
		
		let directory = fs.readdirSync(path);
		
		if(filter)
			directory = directory.filter(filter);
		
		return directory;
	},
	close(path: string)
	{
		if(fs.existsSync(path) && fs.readdirSync(path).length === 0)
			fs.rmdirSync(path);
	}
};

export default Storage;