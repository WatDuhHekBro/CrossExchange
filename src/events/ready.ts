import {client} from "onion-lasers";
import {Config} from "../structures";

client.once("ready", () => {
	if(client.user)
	{
		console.ready(`Logged in as ${client.user.username}#${client.user.discriminator}.`);
		client.user.setActivity({
			type: "LISTENING",
			name: `${Config.prefix}help`
		});
	}
});