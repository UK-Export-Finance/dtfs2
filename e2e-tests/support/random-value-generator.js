import { Chance } from 'chance';

export class RandomValueGenerator {
  static #seed = 0;

  #chance;

  constructor() {
    this.#chance = new Chance(RandomValueGenerator.#seed);
  }

  companyName() {
    return this.#chance.company();
  }
}
