module.exports = {
	description: "Handle your money.",
	common:
	{
		// Returns an embed object
		balance($, author = $.author)
		{
			let user = $.lib.get($.lib.loadJSON('storage').users, author.id, {});
			
			return {
				author:
				{
					name: author.username,
					icon_url: author.avatarURL({
						format: 'png',
						dynamic: true
					})
				},
				color: "#ffff00",
				fields:
				[
					{
						name: "Balance",
						value: $.lib.pluralise($.lib.get(user, 'money', 0), 'credit', 's')
					},
					{
						name: "uwuing Penalties",
						value: $.lib.pluralise($.lib.get(user, 'penalties', 0) * 350, 'credit', 's')
					}
				]
			};
		}
	},
	run($)
	{
		$.channel.send({embed: $.common.balance($)});
	},
	subcommands:
	{
		send:
		{
			message: "You need to enter an amount you're sending.",
			number:
			{
				message: "Who are you sending this money to?",
				any:
				{
					async run($)
					{
						let amount = Math.floor($.args[0]);
						let storage = $.lib.loadJSON('storage');
						let senderData = $.lib.get(storage.users, $.author.id, {});
						let senderMoney = $.lib.get(senderData, 'money', 0);
						
						if(senderMoney < amount)
							$.channel.send("You don't have enough money to do that!", {embed: $.common.balance($)});
						else if(amount > 0)
						{
							if(/<@!\d+>/.test($.args[1]))
							{
								let receiverID = $.args[1].substring(3, $.args[1].length-1);
								let receiver = $.guild.members.cache.get(receiverID).user;
								let receiverData = $.lib.get(storage.users, receiverID, {});
								let receiverMoney = $.lib.get(receiverData, 'money', 0);
								senderData.money -= amount;
								receiverData.money += amount;
								$.channel.send(`${$.author.toString()} has sent ${$.lib.pluralise(amount, 'credit', 's')} to ${receiver.toString()}!`);
							}
							else
							{
								let username = $.args.slice(1).join(' ');
								let members = await $.guild.members.fetch({
									query: username,
									limit: 1
								});
								
								if(members.first())
								{
									let receiver = members.first().user;
									let message = await $.channel.send("Is this the person you're looking for?", {embed: {
										author:
										{
											name: receiver.username + '#' + receiver.discriminator,
											icon_url: receiver.avatarURL({
												format: 'png',
												dynamic: true
											})
										},
										color: "#ffff00"
									}});
									await message.react('✅');
									await message.react('❌');
									
									// Put this after the bot reacts because there's a timeout (in milliseconds) for awaitReactions where there won't be any commands executed until then.
									let isCorrect = false;
									let isDeleted = false;
									// Because of that though, you also need to edit the message to let the user know when they can react.
									await message.edit(message.content + " You can now react to this message.");
									await message.awaitReactions((reaction, user) => {
										if(user.id === $.author.id)
										{
											if(reaction.emoji.name === '✅')
												isCorrect = true;
											isDeleted = true;
											message.delete();
										}
									}, {time: 10000});
									
									if(!isDeleted)
										message.delete();
									
									if(isCorrect)
									{
										let receiverData = $.lib.get(storage.users, receiver.id, {});
										let receiverMoney = $.lib.get(receiverData, 'money', 0);
										senderData.money -= amount;
										receiverData.money += amount;
										$.channel.send(`${$.author.toString()} has sent ${$.lib.pluralise(amount, 'credit', 's')} to ${receiver.toString()}!`);
										$.lib.writeJSON('storage'); // It seems that after any async operation, you can't rely on auto-write anymore.
									}
								}
								else
									$.channel.send(`Couldn't find a user by the name of "${username}"!`);
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
		},
		leaderboard:
		{
			run($)
			{
				// Really nice foresight there. :/ Should this be separated by guild?
				if($.guild.available)
				{
					let users = $.lib.loadJSON('storage').users;
					let tags = Object.keys(users);
					tags.sort((a, b) => {return users[b].money - users[a].money});
					let fields = [];
					
					for(let i = 0, limit = Math.min(10, tags.length); i < limit; i++)
					{
						let id = tags[i];
						
						fields.push({
							name: $.guild.members.cache.get(id).user.username,
							value: $.lib.pluralise(users[id].money, 'credit', 's')
						});
					}
					
					$.channel.send({embed: {
						author:
						{
							name: $.guild.name,
							icon_url: $.guild.iconURL({
								format: 'png',
								dynamic: true
							})
						},
						title: "Top 10 Richest Players",
						color: "#ffff00",
						fields: fields
					}});
				}
			}
		}
	},
	any:
	{
		async run($)
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
				let members = await $.guild.members.fetch({
					query: username,
					limit: 1
				});
				
				if(members.first())
					$.channel.send({embed: $.common.balance($, members.first().user)});
				else
					$.channel.send(`Couldn't find a user by the name of "${username}"!`);
			}
		}
	}
};