"use strict";
class InvalidEnvironmentVariableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
module.exports = InvalidEnvironmentVariableError;
