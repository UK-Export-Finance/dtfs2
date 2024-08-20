/**
 * Gets an integer SQL id generator (starting at 1 and incrementing by 1)
 * @returns An integer SQL id generator
 */
export function* getSqlIdGenerator(): Generator<number, number, unknown> {
  let id = 1;
  while (true) {
    yield id;
    id += 1;
  }
}
