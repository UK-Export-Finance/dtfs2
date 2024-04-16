"use strict";
var _Hasher_hashStrategy;
const tslib_1 = require("tslib");
const crypto = require('node:crypto');
class Hasher {
    constructor(hashStrategy) {
        _Hasher_hashStrategy.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _Hasher_hashStrategy, hashStrategy, "f");
    }
    hash(target) {
        const salt = tslib_1.__classPrivateFieldGet(this, _Hasher_hashStrategy, "f").generateSalt();
        const hash = tslib_1.__classPrivateFieldGet(this, _Hasher_hashStrategy, "f").generateHash(target, salt);
        return {
            hash,
            salt,
        };
    }
    verifyHash({ target, salt, hash }) {
        const targetHash = tslib_1.__classPrivateFieldGet(this, _Hasher_hashStrategy, "f").generateHash(target, salt);
        return crypto.timingSafeEqual(targetHash, hash);
    }
}
_Hasher_hashStrategy = new WeakMap();
module.exports = {
    Hasher,
};
