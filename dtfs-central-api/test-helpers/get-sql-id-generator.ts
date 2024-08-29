/**
 * Gets an integer SQL id generator with ids starting at 1 and incrementing by 1 on each yield
 *
 * @generator
 * @yields An integer id
 * @returns An integer id (technically this generator never and will always `yield`)
 *
 * @example
 * const idGenerator = getSqlIdGenerator();
 * idGenerator.next().value // 1
 * idGenerator.next().value // 2
 * idGenerator.next().value // 3
 */
export function* getSqlIdGenerator(): Generator<number, number, unknown> {
  let id = 1;
  while (true) {
    yield id;
    id += 1;
  }
}
