module.exports = {
	description: "Handle your money.",
	common:
	{
		// Returns an embed object
		balance($, author = $.author)
		{
			let user = $.lib.get($.lib.loadJSON('storage').users, author.id, {});
			let amountOfMoney = $.lib.pluralise($.lib.get(user, 'money', 0), 'credit', 's');
			
			return {
				author:
				{
					name: author.username,
					icon_url: author.avatarURL()
				},
				description: `Balance: ${amountOfMoney}`,
				color: "#ffff00"
			};
		}
	},
	run($)
	{
		$.channel.send({embed: $.common.balance($)});
	},
	subcommands:
	{
		pay:
		{
			message: "You need to enter an amount you're sending.",
			number:
			{
				message: "Who are you sending this money to?",
				any:
				{
					run($)
					{
						let amount = Math.floor($.args[0]);
						
						if(amount > 0)
						{
							if(/<@!\d+>/.test($.args[1]))
							{
								let userID = $.args[1].substring(3, $.args[1].length-1);
								let user = $.guild.members.cache.get(userID).user;
								let userData = $.lib.get($.lib.loadJSON('storage').users, userID, {});
								let senderData = $.lib.get($.lib.loadJSON('storage').users, $.author.id, {});
								userData.money = $.lib.get(userData, 'money', 0) + amount;
								senderData.money = $.lib.get(senderData, 'money', 0) - amount;
								$.channel.send(`${$.author.toString()} has sent ${$.lib.pluralise(amount, 'credit', 's')} to ${user.toString()}!`);
							}
							else
							{
								let username = $.args.slice(1).join(' ');
								
								$.guild.members.fetch({
									query: username,
									limit: 1
								}).then(members => {
									if(members.first())
									{
										let user = members.first().user;
										
										$.channel.send(`Is this the person you're looking for?`, {
											embed:
											{
												author:
												{
													name: user.username + '#' + user.discriminator,
													icon_url: user.avatarURL()
												},
												color: "#ffff00"
											}
										}).then(message => {
											message.react("✅").then(console.log).catch(console.error);
											message.react("❌").then(console.log).catch(console.error);
										}).catch(console.error);
									}
									else
										$.channel.send(`Couldn't find a user by the name of "${username}"!`);
								}).catch(console.error);
								
								// Add an on-react event listener
							}
						}
						else
							$.channel.send("You must send at least one credit!");
					}
				}
			}
		},
		get:
		{
			run($)
			{
				let user = $.lib.get($.lib.loadJSON('storage').users, $.author.id, {});
				let date = new Date();
				
				if(!user.lastReceived)
				{
					user.money = 500;
					user.lastReceived = {
						year: date.getUTCFullYear(),
						month: date.getUTCMonth()+1,
						day: date.getUTCDate()
					};
					$.channel.send("Here's 500 credits to get started.", {embed: $.common.balance($)});
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
						$.channel.send("Here's your daily 100 credits.", {embed: $.common.balance($)});
					}
					else
						$.channel.send("It's too soon to pick up your daily credits.");
				}
			}
		}
	},
	any:
	{
		run($)
		{
			if(/<@!\d+>/.test($.args[0]))
			{
				let userID = $.args[0].substring(3, $.args[0].length-1);
				let user = $.guild.members.cache.get(userID).user;
				$.channel.send({embed: $.common.balance($, user)});
			}
			else
			{
				let username = $.args.join(' ');
				
				$.guild.members.fetch({
					query: username,
					limit: 1
				}).then(members => {
					if(members.first())
						$.channel.send({embed: $.common.balance($, members.first().user)});
					else
						$.channel.send(`Couldn't find a user by the name of "${username}"!`);
				}).catch(console.error);
			}
		}
	}
};