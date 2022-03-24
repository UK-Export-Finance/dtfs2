// Helper function that checks whether 2 arrays are exactly the same
// 1. it checks if their length is the same
// 2. it checks whether each element is the same
const equalArrays = (arrayOne, arrayTwo) => arrayOne.length === arrayTwo.length && arrayOne.every((element, index) => element === arrayTwo[index]);

module.exports = { equalArrays };
