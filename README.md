# KS_BOT_Client_Node

## Node.js Framework for interacting with KS-BOT without any app
> SIDE NOTE: To use ks-bot-client you will need to create a user account at: [kids smit](https://www.kidssmit.com)
To get started simply install ks-bot-client, simply install it with the following command:

````Node
npm i @kids_smit/ks_bot_client_node
````
You can also get ks-bot-client with the following script link

```HTML
<script src="https://ksbot.kidssmit.com/static/js/ks_bot.js"></script>
```

# After Installation:
- Simply import __ks_bot_client_node__ module
```JavaScript
const Bot = require("ks_bot_client_node");
```

- Next create a customBot class by inheriting from ks_bot_client_node.Bot, or you could use ks_bot_client_node.Bot class directly

```JavaScript
class CustomBot extends Bot {}
```

- Once your __customBot class__ has been created, you will then have to initialize your bot

```JavaScript
let custom = new CustomBot("<your name>", "<your password>", <log: true | false>)
```

- Next you will need to go ahead and start registering events for KS-BOT, before you login. __If a event is not registered and you login, the default event handlers will be used.__

```JavaScript
custom.add_event("starting_login", function() {
    console.log("I am loggin in");
});
  
custom.add_event("login_finished", function() {
    console.log("I just finished loggin");
});
  
custom.add_event("start_run", function() {
    console.log("I am going to start running");
});
  
custom.add_event("ready_to_run", function() {
    console.log("I said i am ready to run");
    custom.send_command("hello")
});
  
custom.add_event("welcome_message", function(data) {
    console.log("Server said hello");
    // data is your previous data
});
  
custom.add_event("bot_reply", function(data) {
    console.log("I am ready to reply to you");
    console.log(data); // data is bot reply
});
  
custom.add_event("timer_over", function(data) {
    console.log("Your timer is over");
    // data is your timer event notification
});

```
- Once your events has been registered, you can now login and start using your bot

```JavaScript
custom.log_in()
```
