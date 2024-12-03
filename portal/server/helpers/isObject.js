const isObject = (el) => typeof el === 'object' && el !== null && !(el instanceof Array);

module.exports = isObject;
