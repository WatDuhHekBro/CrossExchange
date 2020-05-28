module.exports = {
	description: "(test) manually updates iterations",
	run(message, args, lib)
	{
		let storage = lib.readJSON('storage', {});
		let date = new Date();
		
		storage.lastUpdated = {
			year: date.getUTCFullYear(),
			month: date.getUTCMonth()+1,
			day: date.getUTCDate(),
			iterations: Math.floor((date.getUTCHours()*3600 + date.getUTCMinutes()*60 + date.getUTCSeconds())/120),
			//offset: Math.floor(Math.random()*120)
		};
		
		message.channel.send(storage.lastUpdated.iterations);
		
		lib.writeJSON('storage', storage);
	}
};