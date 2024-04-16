"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleExpressValidatorResult = void 0;
const express_validator_1 = require("express-validator");
/**
 * Middleware to be used with express-validator validations.
 * Returns a 400 error if any previous validations have failed.
 */
const handleExpressValidatorResult = (req, res, next) => {
    const validationResults = (0, express_validator_1.validationResult)(req);
    if (!validationResults.isEmpty()) {
        res.status(400).json({ message: 'Bad Request', errors: validationResults.array() });
        return;
    }
    next();
};
exports.handleExpressValidatorResult = handleExpressValidatorResult;
