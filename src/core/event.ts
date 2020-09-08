import Storage from "./storage";
import path from "path";

export function loadEvents()
{
	const eventsDir = path.join(ROOT_DIRECTORY, "events");
	
	for(const file of Storage.open(eventsDir, (filename: string) => filename.endsWith(".js")))
	{
		const header = file.substring(0, file.indexOf(".js"));
		console.log(`Loading Event: ${header}`);
		
		import(path.join(eventsDir, header)).then(() => {
			console.log(`Event ${header} successfully loaded!`);
		}).catch(() => {
			console.error(`Event ${header} failed to load!`);
		});
	}
}