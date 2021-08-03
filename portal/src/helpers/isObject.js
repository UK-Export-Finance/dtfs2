const isObject = (el) => typeof el === 'object' && el !== null && !(el instanceof Array);

export default isObject;
