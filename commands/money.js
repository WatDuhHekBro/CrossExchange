module.exports = {
	description: "Handle your money.",
	run($)
	{
		$.channel.send({embed: balance($)});
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
						let senderData = storage.users.access($.author.id, {});
						let senderMoney = senderData.access('money', 0);
						
						if(amount <= 0)
						{
							$.channel.send("You must send at least one credit!");
							return;
						}
						else if(senderMoney < amount)
						{
							$.channel.send("You don't have enough money to do that!", {embed: balance($)});
							return;
						}
						
						if(/<@!\d+>/.test($.args[1]))
						{
							let receiverID = $.args[1].substring(3, $.args[1].length-1);
							let receiver = $.guild.members.cache.access(receiverID).user;
							let receiverData = storage.users.access(receiverID, {});
							let receiverMoney = receiverData.access('money', 0);
							senderData.money -= amount;
							receiverData.money += amount;
							$.channel.send(`${$.author.toString()} has sent ${amount.pluralise('credit', 's')} to ${receiver.toString()}!`);
						}
						else
						{
							let username = $.args.slice(1).join(' ');
							let members = await $.guild.members.fetch({
								query: username,
								limit: 1
							});
							
							if(!members.first())
							{
								$.channel.send(`Couldn't find a user by the name of "${username}"!`);
								return;
							}
							
							let receiver = members.first().user;
							let message = await $.channel.send("Is this the person you're looking for?", {embed: {
								author:
								{
									name: `${receiver.username}#${receiver.discriminator}`,
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
								let receiverData = storage.users.access(receiver.id, {});
								let receiverMoney = receiverData.access('money', 0);
								senderData.money -= amount;
								receiverData.money += amount;
								$.channel.send(`${$.author.toString()} has sent ${amount.pluralise('credit', 's')} to ${receiver.toString()}!`);
								$.lib.writeJSON('storage'); // It seems that after any async operation, you can't rely on auto-write anymore.
							}
						}
					}
				}
			}
		},
		get:
		{
			run($)
			{
				let user = $.lib.loadJSON('storage').users.access($.author.id, {});
				let date = new Date();
				
				if(!user.lastReceived)
				{
					user.money = 500;
					user.lastReceived = {
						year: date.getUTCFullYear(),
						month: date.getUTCMonth()+1,
						day: date.getUTCDate()
					};
					$.channel.send("Here's 500 credits to get started.", {embed: balance($)});
				}
				else
				{
					// If today's date is the same as lastReceived, exit.
					if(user.lastReceived.year === date.getUTCFullYear() &&
						user.lastReceived.month === (date.getUTCMonth()+1) &&
						user.lastReceived.day === date.getUTCDate())
					{
						$.channel.send("It's too soon to pick up your daily credits.");
						return;
					}
					
					user.access('money', 0);
					user.money += 100;
					$.channel.send("Here's your daily 100 credits.", {embed: balance($)});
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
							name: $.guild.members.cache.access(id).user.username,
							value: users[id].money.pluralise('credit', 's')
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
				let user = $.guild.members.cache.access(userID).user;
				$.channel.send({embed: balance($, user)});
			}
			else
			{
				let username = $.args.join(' ');
				let members = await $.guild.members.fetch({
					query: username,
					limit: 1
				});
				
				if(members.first())
					$.channel.send({embed: balance($, members.first().user)});
				else
					$.channel.send(`Couldn't find a user by the name of "${username}"!`);
			}
		}
	}
};

// Returns an embed object
function balance($, author = $.author)
{
	let user = $.lib.loadJSON('storage').users.access(author.id, {}); 
	
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
				value: user.access('money', 0).pluralise('credit', 's')
			},
			{
				name: "uwuing Penalties",
				value: (user.access('penalties', 0) * 350).pluralise('credit', 's')
			}
		]
	};
}