module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
    uuid: require.resolve('uuid'),
  },
};
