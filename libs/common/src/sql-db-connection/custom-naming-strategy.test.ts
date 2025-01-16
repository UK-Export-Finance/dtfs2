import { CustomNamingStrategy } from './custom-naming-strategy';

describe('custom-naming-strategy', () => {
  describe('CustomNamingStrategy', () => {
    const strategy = new CustomNamingStrategy();

    describe('columnName', () => {
      describe('when customName is provided', () => {
        it.each`
          customName       | embeddedPrefixes          | expected                  | description
          ${'custom'}      | ${[]}                     | ${'custom'}               | ${'there are no embedded prefixes'}
          ${'custom'}      | ${['prefix']}             | ${'prefixCustom'}         | ${'there is one embedded prefixes'}
          ${'custom'}      | ${['prefix1', 'prefix2']} | ${'prefix1Prefix2Custom'} | ${'there are multiple embedded prefixes'}
          ${'customName'}  | ${['prefixWord']}         | ${'prefixWordCustomName'} | ${'the inputs are in camel case'}
          ${'custom_name'} | ${['prefix_word']}        | ${'prefixWordCustomName'} | ${'the inputs are in snake case'}
          ${'custom name'} | ${['prefix word']}        | ${'prefixWordCustomName'} | ${'the inputs are in space separated'}
        `(
          'should return the customName prefixed by all the prefixes in camel case when $description',
          ({ customName, embeddedPrefixes, expected }: { customName: string; embeddedPrefixes: string[]; expected: string }) => {
            // Act
            const result = strategy.columnName('propertyName', customName, embeddedPrefixes);

            // Assert
            expect(result).toEqual(expected);
          },
        );
      });

      describe('when customName is not provided', () => {
        it.each`
          propertyName       | embeddedPrefixes          | expected                    | description
          ${'property'}      | ${[]}                     | ${'property'}               | ${'there are no embedded prefixes'}
          ${'property'}      | ${['prefix']}             | ${'prefixProperty'}         | ${'there is one embedded prefixes'}
          ${'property'}      | ${['prefix1', 'prefix2']} | ${'prefix1Prefix2Property'} | ${'there are multiple embedded prefixes'}
          ${'propertyName'}  | ${['prefixWord']}         | ${'prefixWordPropertyName'} | ${'the inputs are in camel case'}
          ${'property_name'} | ${['prefix_word']}        | ${'prefixWordPropertyName'} | ${'the inputs are in snake case'}
          ${'property name'} | ${['prefix word']}        | ${'prefixWordPropertyName'} | ${'the inputs are in space separated'}
        `(
          'should return the propertyName prefixed by all the prefixes in camel case when $description',
          ({ propertyName, embeddedPrefixes, expected }: { propertyName: string; embeddedPrefixes: string[]; expected: string }) => {
            // Act
            const result = strategy.columnName(propertyName, '', embeddedPrefixes);

            // Assert
            expect(result).toEqual(expected);
          },
        );
      });
    });
  });
});
