module.exports = {
	run($)
	{
		let storage = $.lib.loadJSON('config');
		storage.reload = !storage.reload;
		$.channel.send(storage.reload ? "Now reloading after every command." : "No longer reloading after every command.");
	}
};