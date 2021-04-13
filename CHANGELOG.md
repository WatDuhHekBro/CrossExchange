# 1.2.0
- Moved command handler code to [Onion Lasers](https://github.com/WatDuhHekBro/OnionLasers).
- Improved intercept searching.

# 1.1.3
- Added documentation.
- Modified the `Command` class' typings.

# 1.1.2
- Modularized finding members by their username.

# 1.1.1
- Added a test suite and auto-prune for production.

# 1.1.0 - Structural Overhaul!
- Ported over the structural overhaul from my work on TravBot-v3, adding dynamic events, command categories, permissions, and aliases.
- Added `money set` which allows the bot owner to forcefully change the amount of money someone has.
- Moved `admin init` to `stonks init`.

# 1.0.1
- Removed the market catalog feature. This was due to catastrophic results when simulating the market for 50 days. There was an out of memory error when loading in the data.
- Made message intercept false by default. I think it's better to make it more of a voluntary action.

# 1.0.0 - Implemented the core features of the bot.
