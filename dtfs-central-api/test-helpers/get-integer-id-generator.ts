/**
 * Gets an incrementing positive integer id generator
 * @param startValue - The positive integer to start at
 * @param [increment] - The value to increment by
 * @returns A positive integer id generator
 */
export function* getIncrementingPositiveIntegerIdGenerator(startValue: number, increment = 1): Generator<number, number, unknown> {
  let id = startValue;

  if (increment < 0 || !Number.isInteger(increment)) {
    throw new Error(`Supplied id generator increment must be a positive integer (received '${increment}')`);
  }

  const assertIdIsPositive = () => {
    if (id < 0) {
      throw new Error('Generated integer id must be positive');
    }
  };

  while (true) {
    yield id;
    id += increment;
    assertIdIsPositive();
  }
}
