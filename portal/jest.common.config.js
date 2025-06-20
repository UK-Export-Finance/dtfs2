module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
    uuid: require.resolve('uuid'),
  },
};
