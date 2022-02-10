# KS_BOT_Client_Node

## Node.js Framework for interacting with KS-BOT without any app

To get started simply install ks-bot-client, simply install it with the following command:

````Node
npm i @kids_smit/ks_bot_client_node
````

# After Installation:
- Simply import __ks_bot_client_node__ module
```JavaScript
const Bot = require("ks_bot_client_node");
```

- Next create a customBot class by inheriting from ks_bot_client_node.Bot

```JavaScript
class CustomBot extends Bot {

    /**
     * Runs Once Bot is ready to run
     */
    ready = () => {
        console.log(Bot.__version__)
        console.log("Ready to run")
        this.send_command("hey")
    }

    /**
     * Called when ever an error is catched
     * @param {string} error_statement - Error Statement provided by bot
     * @param {Error} err - Actual Error being thrown
     */
    errorCallback(error_statement, err) {
        console.log(error_statement, err)
    }

    /**
     * Handles the WelcomeMessage event from server
     * This events occurs whenever you first connect to server
     * @param {Object.<string, Object>} data - Data received from server regarding event
     */
    _event_Welcome_Message = (data) => {
        console.log("You are being welcomed by server")
    }

    /**
     * Handles the BotProcessReply event from server
     * This event occurs when ever your command has been processed
     * @param {Object.<string, Object>} data - Data received from server regarding event
     */
    _event_Bot_Process_Reply = (data) => {
        console.log("KS-BOT said: ", data)
    }

    /**
     * Handles the "Timer Over" event from server
     * This events occurs when ever your preset timer is over
     * @param {Object.<string, Object>} data - Data received from server regarding event
     */
    _event_Timer_Over = (data) => {
        console.log("KS-BOT says your timer is over, Timer Data: ", data)
    }
}
```

- Once your __customBot class__ has been created, you will then have to initialize your bot

```JavaScript
let custom = new CustomBot("<your name>", "<your password>", <log: true | false>)
```
- Use __CustomBot.ready__ function, to start sending and receiving commands from server.