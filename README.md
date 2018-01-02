# OVH Chatbot - Node.js

![OVH Chatbot Cover](FBcover.png)
[![Maintenance](https://img.shields.io/maintenance/yes/2018.svg)]() [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/ovh/ux) [![travis](https://travis-ci.org/ovh-ux/ovh-chatbot.svg?branch=master)](https://travis-ci.org/ovh-ux/ovh-chatbot) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://github.com/ovh-ux/cz-ovh-commit)

The main goal of this tool is to help [OVH](https://ovh.com) clients in order to have faster responses when you have some problems with OVH services. For example for web hosting you can ask why your website is broken and then this chatbot will find a solution to fix that.

## Setup
Visit [INSTALL.md](INSTALL.md) to setup and test on Slack or Facebook.


## Project overview
+ [`bots`](bots/README.md) --> Represent all the modules about the bot's answers and it's specific type with an intention already given.
+ [`config`](config/README.md) --> The configuration of tools and configuration variables are in this directory.
+ [`constants`](constants/README.md) --> Represents the constants of the project.
+ [`controllers`](controllers/README.md) --> The controllers contain handler function of an express route.
+ [`diagnostics`](diagnostics/README.md) --> Contains all the modules for the diagnostics.
+ `models` --> Contains database models.
+ [`providers`](providers/README.md) --> Tools used globally in all the project.
+ `routes` --> Route declarations of the API.
+ [`platforms`](platforms/README.md) --> Contains all the handlers to communicate with different platforms.
+ [`utils`](utils/README.md) --> Contains all the utilities and API connector to make this chatbot works.
+ `views` --> Only to display a confirmations page when you logged in with your OVH account


## Supported platforms

### Facebook Messenger
This project handles callbacks for authentication, messages, delivery confirmation and postbacks. More details are available at the [Facebook Documentations](https://developers.facebook.com/docs/messenger-platform/webhook-reference).

### Slack
This project handles callbacks for authentication, messages and postback actions. More details are available at the [Slack Documentations](https://api.slack.com/).

### Web (OVH managers)
This project handles callbacks messages and postback actions. The authentication is handled by the managers.The bot *only* checks if the user is logged in or not.

## Bot functions

The bot uses [api.ai](https://www.api.ai) as a language processor.

### Responses/Intents

> To avoid confusions:
> + **Intent**: what the user *ask* to the bot.
> + **Response**: What the bot *respond* to an user.

All the intents needing processed responses can be found [here](bots/).

The intents which doesn't need processed responses (aka: answers to basic questions) are stored in the [api.ai](https://www.api.ai) database, have a look at the [api.ai folder](apiai/).

This intents and response are translated in:
+ Dutch
+ English (US, CA, GB)
+ French
+ German
+ Italian
+ Portuguese
+ Spanish

### Diagnostics
Currently, this bot is able to:
+ diagnose a website
+ diagnose a xDSL line
+ diagnose a land line
+ warn about the expiration of a service
+ warn when an incident happens

More details [here](diagnostics/)


## Contributing

Have a look at the [Contributing section](CONTRIBUTING.md). If you have any question feel free to discuss about it  on our [Gitter](https://gitter.im/ovh/ux).

### Add a new platform [visit this page](platforms/README.md)

### Add a new intent and response [visit this page](bots/README.md)

### Add a new diagnostic [visit this page](diagnostics/README.md)


## Roadmap

+ Refactor to typescript
+ Docker compose
+ Documentation
+ Cloud diagnostics (vps)
+ Order followup
+ Improve conversation skill

## License
See https://github.com/ovh-ux/ovh-chatbot/blob/master/LICENSE
