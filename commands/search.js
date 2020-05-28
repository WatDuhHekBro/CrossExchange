module.exports = {
	run(message, args, lib)
	{
		let collector = message.channel.createMessageCollector({
			filter: new RegExp(args[0])
		});
		collector.on('collect', console.log);
		//collector.on('end', collected => console.log('Collected:', collected.size));
		/*message.channel.messages.fetch({
			limit: -1,
			before: message.id
		}).then(messages => {
			console.log(messages);
		}).catch(console.error);*/
	}
};