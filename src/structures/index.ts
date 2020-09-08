import FileManager from "../core/storage";
import {watch} from "fs";
import {ConfigStructure} from "./config";
import {StorageStructure} from "./storage";
import {StonksStructure} from "./stonks";

// Exports instances. Don't worry, importing it from different files will load the same instance.
export let Config = new ConfigStructure(FileManager.read("config"));
export let Storage = new StorageStructure(FileManager.read("storage"));
export let Stonks = new StonksStructure(FileManager.read("stonks"));

// This part will allow the user to manually edit any JSON files they want while the program is running which'll update the program's cache.
// However, fs.watch is a buggy mess that should be avoided in production. While it helps test out stuff for development, it's not a good idea to have it running outside of development as it causes all sorts of issues.
if(IS_DEV_MODE)
{
	watch("data", (event, filename) => {
		console.debug("File Watcher:", event, filename);
		const header = filename.substring(0, filename.indexOf(".json"));
		
		switch(header)
		{
			case "config": Config = new ConfigStructure(FileManager.read("config")); break;
			case "storage": Storage = new StorageStructure(FileManager.read("storage")); break;
			case "stonks": Stonks = new StonksStructure(FileManager.read("stonks")); break;
		}
	});
}