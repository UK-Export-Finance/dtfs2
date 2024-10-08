import { objectIsEmpty } from './object';

describe('objectIsEmpty', () => {
  const name = 'DTFS';

  it.each`
    value               | expected
    ${{}}               | ${true}
    ${{ key: 'value' }} | ${false}
    ${{ name }}         | ${false}
    ${[]}               | ${true}
    ${null}             | ${true}
    ${undefined}        | ${true}
    ${''}               | ${true}
    ${'ABC'}            | ${true}
    ${'!"£'}            | ${true}
    ${123}              | ${true}
  `('Returns $expected when the input specified is $value', ({ value, expected }: { value: object; expected: boolean }) => {
    expect(objectIsEmpty(value)).toEqual(expected);
  });
});
