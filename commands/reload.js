module.exports = {
	run(message, args, lib)
	{
		let storage = lib.readJSON('config');
		storage.reload = !storage.reload;
		message.channel.send(storage.reload ? "Now reloading after every command." : "No longer reloading after every command.");
		lib.writeJSON('config', storage);
	}
};