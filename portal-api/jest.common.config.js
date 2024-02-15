module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
};
