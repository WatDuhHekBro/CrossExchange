import {client} from "../index";
import {Config} from "../structures";

client.once("ready", () => {
    console.ready(`Logged in as ${client.user!.tag}.`);
    client.user!.setActivity({
        type: "LISTENING",
        name: `${Config.prefix}help`
    });
});
