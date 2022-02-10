const fetch = require("node-fetch");
const io = require("socket.io-client");

const {UserDoesNotExist, UnableToSendMessageToServer} = require("./bot_error")

/**
 * Bot class that handles communication between user and sever
 */
class Bot {
    static __version__ = "1.0.0";

    /**
     * Creates a instance of your KS-BOT
     * @param {str} name - Either Username, First Name of user or email of user
     * @param {str} password - User password
     * @param {boolean} log - Tells bot whether or not it should log its errors to the console
     */
    constructor(name, password, log=true){
        this.name = name;
        this.password = password;
        this.log = log
        this.session_id = null;

        this.can_run = false;
        this.web_url = "https://ksbot.kidssmit.com"
        this.socket_io = null;
        this.log_in()
    }

    /**
     * Logs the user in, and starts the run process of the bot
     */
    log_in = () => {
        let name = this.name;
        let password = this.password;
        let this1 = this;
        fetch("https://ksbot.kidssmit.com/does_user_exist", {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                password: password
            }),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
        .then(json => {
            if (json.returns == "User exist") {
                this1.session_id = json.data.id;
                this1.can_run = true;
                try {
                    this1.run()
                }catch(err) {
                    if (this.log) {
                        this1.errorCallback("Problem in the run function", err)
                    }
                }
            }else {
                throw new UserDoesNotExist("User does not exist")
            }
        }).catch(err => {
            if (this.log) {
                this1.errorCallback("LogIn Failed", err)
            }
        })
    }

    /**
     * Starts the run process of bot
     */
    run = () => {
        if (this.can_run) {
            this.socket_io = io(this.web_url)
            this.socket_io.on("error", this.errorCallback)
            this.socket_io.emit("launch_bot", {
                session_id: this.session_id
            })
            this.socket_io.on("WelcomeMessage", this.welcome)
            this.socket_io.on("BotProcessReply", this._event_Bot_Process_Reply)
            this.socket_io.on("Timer Over", this._event_Timer_Over)
        }
    }

    /**
     * Handles the welcome event of server
     * @param {Object.<string, Object>} data - Data sent by server on welcome event
     */
    welcome = (data) => {
        this._event_Welcome_Message(data)
        this.ready()
    }

    /**
     * Sends Message to server for processing
     * @param {string} message - Message you would like to send
     * @param {string} timeZone - timeZone you want server to think the message is coming from, default is your current timeZone
     * @param {Boolean} log - Whether or not you want to show error log
     */
    send_command = (message, timeZone=null) => {
        try {
            if (this.can_run && this.session_id && this.socket_io){
                let ss_id = this.session_id;
                this.socket_io.emit("process_new_message", {
                    session_id: ss_id,
                    new_message: {
                        message: message,
                        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
                    }
                })
            }else {
                if (this.log){
                    this.errorCallback("Problem sending message to server", new UnableToSendMessageToServer("Problem sending message to server"));
                }
            }
        }catch(err) {
            if (this.log) {
                this.errorCallback("Problem sending message to server", err)
            }
        }
    }

    /**
     * Function called when the bot is ready to run
     */
    ready = () => {

    }

    /**
     * Called when ever an error is catched
     * @param {string} error_statement - Error Statement provided by bot
     * @param {Error} err - Actual Error being thrown
     */
    errorCallback(error_statement, err) {

    }

    /**
     * Handles the WelcomeMessage event from server
     * @param {Object.<string, Object>} data - Data received from server regarding event
     */
    _event_Welcome_Message = (data) => {

    }

    /**
     * Handles the BotProcessReply event from server
     * @param {Object.<string, Object>} data - Data received from server regarding event
     */
    _event_Bot_Process_Reply = (data) => {

    }

    /**
     * Handles the "Timer Over" event from server
     * @param {Object.<string, Object>} data - Data received from server regarding event
     */
    _event_Timer_Over = (data) => {

    }
}

module.exports = Bot