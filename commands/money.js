module.exports = {
	description: "Handle your money.",
	usage: "<amount/pay/get> <amount> <person>",
	args:
	{
		amount:
		{
			
		},
		pay:
		{
			args:
			[
				{
					type: 2
				}
			]
		},
		get:
		{
			
		}
	},
	run(message, args, lib, extra)
	{
		let users = lib.readJSON('users', {});
		let user = users[message.author.id] || (users[message.author.id] = {});
		
		// #ffff00
		if(args[0] === 'amount')
			message.reply(`you have ${user.money || (user.money = 0)} credit${user.money === 1 ? '' : 's'}.`);
		else if(args[0] === 'pay')
		{
			
		}
		else if(args[0] === 'get')
		{
			let date = new Date();
			
			if(!user.lastReceived)
			{
				user.lastReceived = {
					year: date.getUTCFullYear(),
					month: date.getUTCMonth()+1,
					day: date.getUTCDate()
				};
				user.money = 500;
				message.reply("here's 500 credits to get started.");
			}
			else
			{
				if(user.lastReceived.year !== date.getUTCFullYear() || user.lastReceived.month !== (date.getUTCMonth()+1) || user.lastReceived.day !== date.getUTCDate())
				{
					user.money += 100;
					message.reply("here's your daily 100 credits.");
				}
				else
					message.reply("it's too soon to pick up your daily credits.");
			}
		}
		
		lib.writeJSON('users', users);
	}
};