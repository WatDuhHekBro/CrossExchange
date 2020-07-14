import {Client} from "discord.js";
import Storage from "./core/storage";
import setup from "./setup";
import {Config} from "./core/templates";

(async() => {
	await setup.init();
	const config = Storage.read("config") as Config;
	const client = new Client();
	(client as any).prefix = config.prefix;
	(client as any).admins = config.admins;
	client.login(config.token).catch(setup.again);
	const eventFiles = Storage.open("dist/events", file => file.endsWith(".js"));
	
	for(const file of eventFiles)
	{
		const header = file.substring(0, file.indexOf(".js"));
		const event = (await import(`./events/${header}`)).default;
		event.set(client, header);
	}
})()