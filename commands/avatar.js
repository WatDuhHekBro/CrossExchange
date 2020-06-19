module.exports = {
	run($)
	{
		$.client.users.fetch($.args[0]).then(user => {
			$.message.channel.send(user.avatarURL({
				format: 'png',
				dynamic: true,
				size: 4096
			}));
		});
	}
};