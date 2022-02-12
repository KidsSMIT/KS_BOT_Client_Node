const {EventDoesNotExist} = require("./bot_error")

class Events {

    /**
     * Constructor to create a event class
     * @param {Function} log_err_func - Function that should be runned when an error occurs in event
     * @param {boolean} log - Whether or not to log error, default value is true
     */
    constructor(log_err_func, log = true) {
        this.event = {};
        this.Log_Error = log;
        this.log_error_func = log_err_func;
    }

    /**
     * Change whether or not to log error
     * @param {boolean} new_log - Whether or not to log errors
     */
    change_log_error = (new_log) => {
        this.Log_Error  = new_log;
    }

    /**
     * Changes the function that will be ran when an error occurs
     * @param {Function} new_func -  The new function to be runned when ever an aerror occurs
     */
    change_log_function = (new_func) => {
        this.log_error_func = new_func;
    }

    /**
     * Adds new event in the event handler
     * @param {string} event_name - Name of the event you want to add
     * @param {Function} eventFunc - The Function that should be runned when event is called
     */
    add_event = (event_name, eventFunc) => {
        try {
            this.event[event_name] = eventFunc;
        }catch(err) {
            if (this.Log_Error) {
                this.log_error_func(`Problem adding the new event "${event_name}"`, err);
            }
        }
    }

    /**
     * Removes an event from the event dictionary
     * @param {string} event_name - Name of the event you would like to remove
     */
    remove_event = (event_name) => {
        try {
            if (event_name in this.event) {
                delete this.event[event_name];
            }else {
                throw new EventDoesNotExist(`The following event "${event_name}", can not be removed because it does not exist`);
            }
        }catch(err) {
            if (this.Log_Error) {
                this.log_error_func(`Problem removing the event "${event_name}"`, err)
            }
        }
    }

    /**
     * Calls the event if it exist
     * @param {string} event_name - Name of the event you will like to called
     * @param {Array} event_args - List arguments of function
     */
    call_event = (event_name, event_args=[]) => {
        try {
            if (event_name in this.event){
                this.event[event_name](...event_args)
            }else {
                throw new EventDoesNotExist(`The following event "${event_name}", can not be called because it does not exist`);
            }
        }catch (err) {
            if (this.Log_Error) {
                this.log_error_func(`Problem calling the event "${event_name}"`, err)
            }
        }
    }
}

module.exports = Events