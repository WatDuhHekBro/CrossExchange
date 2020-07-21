import fs from "fs";
import $ from "./lib";
import {Collection} from "discord.js";
import Command, {template} from "../core/command";

let commands: Collection<string, Command>|null = null;

const Storage = {
	read(header: string): object
	{
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
				$.warn(`Malformed JSON data (header: ${header}), backing it up.`);
				fs.writeFileSync(`${path}.backup`, file);
			}
		}
		
		return data;
	},
	write(header: string, data: object)
	{
		this.open("data");
		const path = `data/${header}.json`;
		
		if(process.argv[2] === "dev" || header === "config")
			fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
		else
			fs.writeFileSync(path, JSON.stringify(data));
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
	},
	/** Returns the cache of the commands if it exists and searches the directory if not. */
	async loadCommands(): Promise<Collection<string, Command>>
	{
		if(commands)
			return commands;
		
		if(!fs.existsSync("src/commands/test.ts"))
			fs.writeFileSync("src/commands/test.ts", template);
		
		commands = new Collection();
		
		for(const file of Storage.open("dist/commands", (filename: string) => filename.endsWith(".js")))
		{
			const header = file.substring(0, file.indexOf(".js"));
			const command = (await import(`../commands/${header}`)).default;
			commands.set(header, command);
			$.log("Loading Command:", header);
		}
		
		return commands;
	}
};

export default Storage;