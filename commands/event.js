module.exports = {
	run(message, args, lib, extra)
	{
		let stonks = lib.readJSON('stonks');
		
		
		
		lib.writeJSON('stonks', stonks);
	}
};