const equalArrays = (array1, array2) => array1.length === array2.length && array1.every((element, index) => element === array2[index]);

module.exports = { equalArrays };
