module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
};
