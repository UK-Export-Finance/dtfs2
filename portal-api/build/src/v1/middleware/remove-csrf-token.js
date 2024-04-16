"use strict";
/**
 * Global middleware, removes csrf token from body of request if it exists.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {(input?: unknown) => void} next Callback function name
 */
const removeCsrfToken = (req, res, next) => {
    var _a;
    if ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a._csrf) {
        delete req.body._csrf;
    }
    next();
};
module.exports = removeCsrfToken;
