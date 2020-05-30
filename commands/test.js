module.exports = {
	description: "test-desc",
	message: "Top level command intercept.",
	run($)
	{
		/*$.channel.messages.fetch('716390502773293086').then(message => message.edit({
			embed:
			{
				title: "Market Name2",
				description: "Market description...",
				color: "#008000",
				fields:
				[
					{
						name: "date1",
						value: "0"
					}
				]
			}
		})).catch(console.error);*/
	},
	subcommands:
	{
		alpha:
		{
			run($)
			{
				console.log($.args);
				$.channel.send('Subcommand "alpha"');
			},
			subcommands:
			{
				radiation:
				{
					run($)
					{
						console.log($.args);
						$.channel.send('Sub-subcommand "radiation"');
					}
				}
			}
		},
		beta:
		{
			run($)
			{
				console.log($.args);
				$.channel.send('Subcommand "beta"');
			},
			number:
			{
				run($)
				{
					console.log($.args);
					$.channel.send('Second level number command.');
				}
			}
		}
	},
	number:
	{
		run($)
		{
			console.log($.args);
			$.channel.send('Top level number command.');
		}
	}
};