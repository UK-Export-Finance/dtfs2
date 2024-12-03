import { Chance } from 'chance';

/**
 * Class to generate random values for test data.
 *
 * RandomValueGenerator uses a fixed seed to make test runs repeatable (although
 * calling a test on its own or calling changing the test order can change the
 * random values that will be used).
 */
export class RandomValueGenerator {
  static #seed = 0;

  #chance;

  constructor() {
    this.#chance = new Chance(RandomValueGenerator.#seed);
  }

  companyName({ lowerCase } = {}) {
    const companyName = this.#chance.company();
    return lowerCase ? companyName.toLowerCase() : companyName;
  }
}
