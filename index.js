const fetch = require("node-fetch");
const io = require("socket.io-client");

const { UserDoesNotexist, UnableToSendMessageToServer, EventDoesNotExist } = require("./bot_error");
const Events = require("./event");

/**
 * Bot class that handles communication between user and sever
 */
class Bot {
    /**
     * The version of the Bot class
     */
    static __version__ = "2.5.1";

    /**
     * The domain name it will be making request too
     */
    static web_url = "https://ksbot.kidssmit.com"

    /**
     * Returns current Bot version
     */
    static get_version = () => {
        return Bot.__version__;
    }

    /**
     * Console.logs Bot version
     */
    static print_version = () => {
        console.log("Bot Version is: " + Bot.__version__)
    }

    /**
     * Creates a instance of your KS-BOT
     * @param {str} name - Either Username, First Name of user or email of user
     * @param {str} password - User password
     * @param {boolean} log - Tells bot whether or not it should log its errors to the console
     */
    constructor(name, password, log = true) {
        this.name = name;
        this.password = password;
        this.log = log
        this.session_id = null;

        this.can_run = false;
        this.socket_io = null;
        this.event = new Events(this.errorCallback, log)
        this.smit_activated = false;

        // Just registering events to KS-BOT
        this.add_event("starting_login", function() {
            if (log) console.log("Starting to log in")
        })

        this.add_event("login_finished", function() {
            if (log) console.log("Finished log in")
        })

        this.add_event("start_run", function() {
            if (log) console.log("Run Proccess is starting")
        })

        this.add_event("ready_to_run", function() {
            if (log) console.log("KS-BOT is ready to run")
        })

        this.add_event("welcome_message", function(data) {
            if (log) console.log("server said hello", data)
        })

        this.add_event("bot_reply", function(data) {
            console.log("KS-BOT reply is ready")
            console.log(data)
        })

        this.add_event("smith_reply", function(data) {
            console.log("SMITH is ready to reply")
            console.log(data)
        })

        this.add_event("timer_over", function(data) {
            console.log("KS-BOT said timer is over")
            console.log("Timer: ", data)
        })

        this.add_event("activate_smith", function(data) {
            if (log) console.log("Activating S.M.I.T.H");
        })

        this.add_event("de_activate_smith", function(data) {
            if (log) console.log("DeActivating S.M.I.T.H now");
        })

        this.add_event("SPEAK", function(data) {
            console.log("SMITH want you to say: ", data);
        })

        this.add_event("News", function(data) {
            console.log("Your news is: ", data);
        })

        this.add_event("Weather", function(data) {
            console.log("Your weather is: ", data);
        })
    }

    /** 
     * Logs the user in
     */
    log_in = () => {
        this.call_event("starting_login");
        let name = this.name;
        let password = this.password;

        let this1 = this;

        fetch(`${Bot.web_url}/does_user_exist`, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    password: password
                }),
                headers: { "Content-type": "application/json" }
            }).then(res => res.json())
            .then(json => {
                if (json.returns === "User exist") {
                    this1.session_id = json.data.id;
                    this1.can_run = true;
                    try {
                        this1.call_event("login_finished");
                        this1.start_run();
                    } catch (err) {
                        if (this1.log) {
                            this1.errorCallback("Problem in the start run function", err)
                        }
                    }
                } else {
                    throw new UserDoesNotexist("User does not exist");
                }
            }).catch(err => {
                if (this1.log) {
                    this1.errorCallback("LogIn Failed", err)
                }
            })
    }

    /**
     * Called whenever an error is catched
     * @param {string} error_statement - Error Statement provided by Bot
     * @param {Error} err - Actual error being thrown
     */
    errorCallback = (error_statement, err) => {
        console.log(error_statement, err)
    }

    /**
     * Starts the Bot run process and is called once log_in has been completed
     */
    start_run = () => {
        if (this.can_run) {
            this.call_event("start_run");
            this.socket_io = io(Bot.web_url);
            let this1 = this;
            this.socket_io.on("error", function(err) {
                if (this1.log) {
                    this1.errorCallback("Error within SocketIo", err)
                }
            })

            this.socket_io.on("WelcomeMessage", this.welcome);
            this.socket_io.on("BotProcessReply", this.ProcessBotReply);
            this.socket_io.on("Timer Over", this.time_over);
            this.socket_io.on("Switch To Voice Assitant", this.activate_smith);
            this.socket_io.on("Switch To Text Assitant", this.activate_ks_bot);
            this.socket_io.on("SPEAK", this.bot_speak);
            this.socket_io.on("Here is The News", this.news);
            this.socket_io.on("Here is the Weather", this.weather);

            this.socket_io.emit("launch_bot", {
                session_id: this.session_id
            })
        }
    }

    /**
     * Handles the Here is the Weather event of server
     * @param {Object.<string, Object>} data - Data sent by server on Here is the Weather event
     */
    weather = (data) => {
        this.call_event("Weather", [data])
    }

    /**
     * Handles the Here is The News event of server
     * @param {Object.<string, Object>} data - Data sent by server on Here is The News event
     */
    news = (data) => {
        this.call_event("News", [data]);
    }

    /**
     * Handles the SPEAK event of server
     * @param {Object.<string, Object>} data - Data sent by server on SPEAK event
     */
    bot_speak = (data) => {
        this.call_event("SPEAK", [data.what_to_speak]);
    }

    /**
     * Handles the Switch To Text Assitant event of server, and then calls the activate_smith event
     * @param {Object.<string, Object>} data - Data sent by server on Switch To Text Assitant event
     */
    activate_ks_bot = (data) => {
        this.smit_activated = false;
        this.call_event("de_activate_smith", [data])
    }

    /**
     * Handles the Switch To Voice Assitant event of server, and then calls the activate_smith event
     * @param {Object.<string, Object>} data - Data sent by server on Switch To Voice Assitant event
     */
    activate_smith = (data) => {
        this.smit_activated = true;
        this.call_event("activate_smith", [data])
    }

    /**
     * Handles the Timer Over event of server 
     * @param {Object.<string, Object>} data - Data sent by server on Timer Over event
     */
    time_over = (data) => {
        this.call_event("timer_over", [data]);
    }

    /**
     * Handles the BotProcessReply event from UnableToSendMessageToServer
     * @param {Object.<string, Object>} data - Data sent by server in BotProcessReply event
     */
    ProcessBotReply = (data) => {
        if (this.smit_activated) {
            this.call_event("smith_reply", [data]);
        } else {
            this.call_event("bot_reply", [data]);
        }
    }

    /**
     * Handles the welcome event of server 
     * @param {Object.<string, Object>} data - Data sent by server on welcome event
     */
    welcome = (data) => {
        this.call_event("welcome_message", [data]);
        this.call_event("ready_to_run");
    }

    /**
     * Adds or changes events of KS-BOT
     * @param {string} event_name - Event you would like to add or change   
     * @param {Function} event_func - Function that will be runned when that event is ready
     */
    add_event = (event_name, event_func) => {
        try {
            this.event.add_event(event_name, event_func);
        } catch (err) {
            if (this.log) {
                this.errorCallback(`Problem adding new event "${event_name}"`, err);
            }
        }
    }

    /**
     * Sends Message to server for processing
     * @param {string} message - Message you would like to send
     * @param {string} timeZone - timeZone you want server to think the message is form, default is your current location
     */
    send_command = (message, timeZone = null) => {
        try {
            if (this.can_run && this.session_id && this.socket_io) {
                let ss_id = this.session_id;

                this.socket_io.emit("process_new_message", {
                    session_id: ss_id,
                    new_message: {
                        message: message,
                        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
                    }
                })
            } else {
                throw new UnableToSendMessageToServer("Problem sending message to server");
            }
        } catch (err) {
            if (this.log) this.errorCallback("Problem sending message to server", err)
        }
    }

    /**
     * Calls the event if it exist, if it does not an error will be returned and handled
     * @param {string} event_name -  Name of the event you would like to call_event
     * @param {Array} event_args  - List argument of function
     */
    call_event = (event_name, event_args = []) => {
        try {
            if (event_name in this.event.event) {
                this.event.call_event(event_name, event_args)
            } else {
                throw new EventDoesNotExist(`The following event "${event_name}" is not registered to KS-BOT`);
            }
        } catch (err) {
            if (this.log) {
                this.errorCallback(`Problem calling the follwoing event "${event_name}"`, err);
            }
        }
    }
}

module.exports = Bot