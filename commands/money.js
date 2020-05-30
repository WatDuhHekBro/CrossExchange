module.exports = {
	description: "Handle your money.",
	usage: "<amount/pay/get> <amount> <person>",
	message: 'Use subcommands "amount", "pay", or "get".',
	subcommands:
	{
		// #ffff00
		amount:
		{
			run($)
			{
				let user = $.lib.get($.lib.loadJSON('users'), $.author.id, {});
				let amountOfMoney = $.lib.pluralise($.lib.get(user, 'money', 0), 'credit', 's');
				$.message.reply(`You have ${amountOfMoney}`);
			}
		},
		pay:
		{
			run($)
			{
				
			}
		},
		get:
		{
			run($)
			{
				let user = $.lib.get($.lib.loadJSON('users'), $.author.id, {});
				let date = new Date();
				
				if(!user.lastReceived)
				{
					user.lastReceived = {
						year: date.getUTCFullYear(),
						month: date.getUTCMonth()+1,
						day: date.getUTCDate()
					};
					user.money = 500;
					$.message.reply("Here's 500 credits to get started.");
				}
				else
				{
					if(
						user.lastReceived.year !== date.getUTCFullYear() ||
						user.lastReceived.month !== (date.getUTCMonth()+1) ||
						user.lastReceived.day !== date.getUTCDate()
					)
					{
						$.lib.get(user, 'money', 0);
						user.money += 100;
						$.message.reply("Here's your daily 100 credits.");
					}
					else
						$.message.reply("It's too soon to pick up your daily credits.");
				}
			}
		}
	}
};