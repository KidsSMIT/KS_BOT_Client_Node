/**
 * Custom error class that will be supered by other sub custom error classes
 */
class CustomError extends Error {

    constructor (message) {
        super(message);

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor)
    }
}

/**
 * Error Signfies that user does not exist
 */
class UserDoesNotexist extends CustomError {}

/**
 * Error Signifies issue sending message to server
 */
class UnableToSendMessageToServer extends CustomError {}

/**
 * Error Signifies that an event being called does not exist
 */
class EventDoesNotExist extends CustomError {}

module.exports = {
    UserDoesNotexist: UserDoesNotexist,
    UnableToSendMessageToServer: UnableToSendMessageToServer,
    EventDoesNotExist: EventDoesNotExist
}