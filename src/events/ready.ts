import Event from "../core/event";

export default new Event({
	once()
	{
		console.log("Ready!");
	}
});