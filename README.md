# Ghost-Admin with translations support
## Adding admin control panel translation
0. use modified Ghost server https://github.com/ololoken/Ghost
1. Set "General" > "Publication Language" locale you need, for example "ru"
2. Add ru.json to public/assets/locales
3. Rebuild Ghost-Admin
4. That's it

Translation instructions can be found [here](https://github.com/ember-intl)

When your locale file cannot be found or processed, then default english locale will be used;
Same when some translation key is missing or has an error it will fallback to key from english locale.

#NOTE: TESTS are totally broken
Maybe one day I'll try to fix it. But for now see no reason due to https://github.com/TryGhost/Ghost-Admin/pull/1017#issuecomment-420310841 

![](https://github.com/TryGhost/Admin/workflows/Test%20Suite/badge.svg?branch=master)

This is the home of Ember.js based admin client that ships with [Ghost](https://github.com/tryghost/ghost).

**Do you want to set up a Ghost blog?** Check the [getting started guide](https://ghost.org/docs/introduction/)

**Do you want to modify or contribute to Ghost-Admin?** Please read how to [install from source](https://ghost.org/docs/install/source/) and swing by our [forum](https://forum.ghost.org) if you need any help 😄

## Have a bug or issue?

Bugs and issues (even if they only affect the admin client) should be opened on the core [Ghost](https://github.com/tryghost/ghost/issues) repository.

# Copyright & License

Copyright (c) 2013-2021 Ghost Foundation - Released under the [MIT license](LICENSE). Ghost and the Ghost Logo are trademarks of Ghost Foundation Ltd. Please see our [trademark policy](https://ghost.org/trademark/) for info on acceptable usage.
