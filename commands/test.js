module.exports = {
	description: "test-desc",
	message: "Top level command intercept.",
	run($)
	{
		
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