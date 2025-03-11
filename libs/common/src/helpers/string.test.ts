import { isNonEmptyString, isNullUndefinedOrEmptyString, isString, replaceAllSpecialCharacters, formatForSharePoint } from './string';

describe('string helpers', () => {
  describe('isString', () => {
    it.each`
      value                                 | expected
      ${1}                                  | ${false}
      ${true}                               | ${false}
      ${null}                               | ${false}
      ${undefined}                          | ${false}
      ${['a string in an array']}           | ${false}
      ${{ value: 'a string in an object' }} | ${false}
      ${''}                                 | ${true}
      ${'a string'}                         | ${true}
    `('returns $expected when the value is $value', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(isString(value)).toEqual(expected);
    });
  });

  describe('isNullUndefinedOrEmptyString', () => {
    it.each`
      value        | expected
      ${null}      | ${true}
      ${undefined} | ${true}
      ${''}        | ${true}
      ${' '}       | ${true}
      ${'string'}  | ${false}
      ${' string'} | ${false}
      ${'string '} | ${false}
    `('returns $expected when the value is $value', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(isNullUndefinedOrEmptyString(value)).toEqual(expected);
    });
  });

  describe('isNonEmptyString', () => {
    it.each`
      value        | expected
      ${null}      | ${false}
      ${undefined} | ${false}
      ${''}        | ${false}
      ${' '}       | ${false}
      ${'string'}  | ${true}
      ${' string'} | ${true}
      ${'string '} | ${true}
    `('returns $expected when the value is $value', ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(isNonEmptyString(value)).toEqual(expected);
    });
  });

  describe('replaceAllSpecialCharacters', () => {
    it.each`
      value                        | expected
      ${null}                      | ${''}
      ${undefined}                 | ${''}
      ${''}                        | ${''}
      ${' '}                       | ${''}
      ${'  '}                      | ${''}
      ${'\n'}                      | ${''}
      ${'\t'}                      | ${''}
      ${'\n\r'}                    | ${''}
      ${'\n\t'}                    | ${''}
      ${'\n\t'}                    | ${''}
      ${'Exporter&Name'}           | ${'Exporter Name'}
      ${'.Exporter&Name.'}         | ${'Exporter Name'}
      ${'_Exporter_Name_'}         | ${'Exporter Name'}
      ${'_-Exporter_-_Name_-'}     | ${'Exporter Name'}
      ${'_-Export£r_!_Name...---'} | ${'Export r Name'}
      ${'_-GEF...---'}             | ${'GEF'}
      ${'__GEF__'}                 | ${'GEF'}
      ${'    GEF   '}              | ${'GEF'}
      ${'GEF'}                     | ${'GEF'}
      ${'UK Export Finance'}       | ${'UK Export Finance'}
      ${' UK Export Finance '}     | ${'UK Export Finance'}
      ${'_UK_Export_Finance_'}     | ${'UK Export Finance'}
      ${'A & B TEST LIMITED'}      | ${'A B TEST LIMITED'}
      ${'ABCDE FĞHIJK İ.İ-AŞ'}     | ${'ABCDE FGHIJK I I AS'}
    `("should return '$expected' directory or file name when supplied with the '$value'", ({ value, expected }: { value: string; expected: string }) => {
      expect(replaceAllSpecialCharacters(value, ' ')).toBe(expected);
    });
  });
});

describe('formatForSharePoint', () => {
  it.each`
    value                        | expected
    ${'mga ukef 1.docx'}         | ${'mga_ukef_1_docx'}
    ${'MGA UKEF 1.DOCX'}         | ${'MGA_UKEF_1_DOCX'}
    ${'_MGA UKEF 1_.DOCX_'}      | ${'MGA_UKEF_1_DOCX'}
    ${'_MGA&UKEF&1_.DOCX_'}      | ${'MGAandUKEFand1_DOCX'}
    ${'-M!G@A UKE£F 1.DOCX'}     | ${'M_G_A_UKE_F_1_DOCX'}
    ${'MGA_UKEF_001.XLSX'}       | ${'MGA_UKEF_001_XLSX'}
    ${'_vti_cnf'}                | ${''}
    ${'_vti_txt'}                | ${''}
    ${'.lock'}                   | ${''}
    ${'CON'}                     | ${''}
    ${'PRN'}                     | ${''}
    ${'AUX'}                     | ${''}
    ${'NUL'}                     | ${''}
    ${'COM0'}                    | ${''}
    ${'COM7'}                    | ${''}
    ${'LPT0'}                    | ${''}
    ${'LPT7'}                    | ${''}
    ${'desktop.ini'}             | ${''}
    ${null}                      | ${''}
    ${undefined}                 | ${''}
    ${''}                        | ${''}
    ${' '}                       | ${''}
    ${'  '}                      | ${''}
    ${'\n'}                      | ${''}
    ${'\t'}                      | ${''}
    ${'\n\r'}                    | ${''}
    ${'\n\t'}                    | ${''}
    ${'\n\t'}                    | ${''}
    ${'Exporter&Name'}           | ${'ExporterandName'}
    ${'Exporter & Name'}         | ${'Exporter_and_Name'}
    ${'.Exporter&Name.'}         | ${'ExporterandName'}
    ${'_Exporter_Name_'}         | ${'Exporter_Name'}
    ${'_-Exporter_-_Name_-'}     | ${'Exporter_Name'}
    ${'_-Export£r_!_Name...---'} | ${'Export_r_Name'}
    ${'_-GEF...---'}             | ${'GEF'}
    ${'__GEF__'}                 | ${'GEF'}
    ${'    GEF   '}              | ${'GEF'}
    ${'GEF'}                     | ${'GEF'}
    ${'UK Export Finance'}       | ${'UK_Export_Finance'}
    ${' UK Export Finance '}     | ${'UK_Export_Finance'}
    ${'_UK_Export_Finance_'}     | ${'UK_Export_Finance'}
    ${'A & B TEST LIMITED'}      | ${'A_and_B_TEST_LIMITED'}
    ${'ABCDE FĞHIJK İ.İ-AŞ'}     | ${'ABCDE_FGHIJK_I_I_AS'}
  `("should return '$expected' for directory name when supplied with the '$value'", ({ value, expected }: { value: string; expected: string }) => {
    expect(formatForSharePoint(value, '_', false)).toBe(expected);
  });

  it.each`
    value                        | expected
    ${'_vti_cnf'}                | ${''}
    ${'_vti_txt'}                | ${''}
    ${'.lock'}                   | ${''}
    ${'CON'}                     | ${''}
    ${'PRN'}                     | ${''}
    ${'AUX'}                     | ${''}
    ${'NUL'}                     | ${''}
    ${'COM0'}                    | ${''}
    ${'COM7'}                    | ${''}
    ${'LPT0'}                    | ${''}
    ${'LPT7'}                    | ${''}
    ${'desktop.ini'}             | ${''}
    ${null}                      | ${''}
    ${undefined}                 | ${''}
    ${''}                        | ${''}
    ${' '}                       | ${''}
    ${'  '}                      | ${''}
    ${'\n'}                      | ${''}
    ${'\t'}                      | ${''}
    ${'\n\r'}                    | ${''}
    ${'\n\t'}                    | ${''}
    ${'\n\t'}                    | ${''}
    ${'Exporter&Name'}           | ${'ExporterandName'}
    ${'Exporter & Name'}         | ${'Exporter_and_Name'}
    ${'.Exporter&Name.'}         | ${'ExporterandName'}
    ${'_Exporter_Name_'}         | ${'Exporter_Name'}
    ${'_-Exporter_-_Name_-'}     | ${'Exporter_Name'}
    ${'_-Export£r_!_Name...---'} | ${'Export_r_Name.---'}
    ${'_-GEF...---'}             | ${'GEF.---'}
    ${'__GEF__'}                 | ${'GEF'}
    ${'    GEF   '}              | ${'GEF'}
    ${'GEF'}                     | ${'GEF'}
    ${'UK Export Finance'}       | ${'UK_Export_Finance'}
    ${' UK Export Finance '}     | ${'UK_Export_Finance'}
    ${'_UK_Export_Finance_'}     | ${'UK_Export_Finance'}
    ${'A & B TEST LIMITED'}      | ${'A_and_B_TEST_LIMITED'}
    ${'ABCDE FĞHIJK İ.İ-AŞ'}     | ${'ABCDE_FGHIJK_I.İ-AŞ'}
  `("should return '$expected' for file name when supplied with the '$value'", ({ value, expected }: { value: string; expected: string }) => {
    expect(formatForSharePoint(value, '_', true)).toBe(expected);
  });
});
