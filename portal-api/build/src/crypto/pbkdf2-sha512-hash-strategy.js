"use strict";
var _Pbkdf2Sha512HashStrategy_byteGenerator;
const tslib_1 = require("tslib");
const crypto = require('node:crypto');
class Pbkdf2Sha512HashStrategy {
    constructor(byteGenerator) {
        _Pbkdf2Sha512HashStrategy_byteGenerator.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _Pbkdf2Sha512HashStrategy_byteGenerator, byteGenerator, "f");
    }
    generateSalt() {
        return tslib_1.__classPrivateFieldGet(this, _Pbkdf2Sha512HashStrategy_byteGenerator, "f").randomBytes(64);
    }
    generateHash(target, salt) {
        return crypto.pbkdf2Sync(target, salt, 210000, 64, 'sha512');
    }
}
_Pbkdf2Sha512HashStrategy_byteGenerator = new WeakMap();
module.exports = {
    Pbkdf2Sha512HashStrategy,
};
