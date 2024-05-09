import { industryClassElement, appendSelectOption, getIndustryClassesFromSectorCode, changeIndustryClasses } from './change-industry-classes';

describe('changeIndustryClasses', () => {
  const sector100Class12 = { code: '12', name: 'Hotels and similar accommodation' };
  const sector100Class34 = { code: '34', name: 'Holiday centres and villages' };
  const sector200Class12 = { code: '12', name: 'Renting and leasing of cars and light motor vehicles' };
  const sector200Class34 = { code: '34', name: 'Renting and leasing of trucks and other heavy vehicles' };
  const mockSectors = [
    {
      code: '100',
      classes: [sector100Class12, sector100Class34],
    },
    {
      code: '200',
      classes: [sector200Class12, sector200Class34],
    },
  ];

  const maliciousOptionTextContent = '</select><img src=no onerror=alert(1)>';
  const maliciousOptionValue = '"></select><img src=no onerror=alert(1)>';

  beforeEach(() => {
    document.body.innerHTML = '<select id="industry-class"><option value="1">test</option></select>';
  });

  describe('appendSelectOption', () => {
    it('should append a given option to #industryClass select element', () => {
      const mockOption = { value: '2', name: 'test' };
      const element = industryClassElement();

      appendSelectOption(element, mockOption);

      const selectOptions = Array.from(element.options);

      expect(selectOptions.length).toEqual(2);
      expect(selectOptions[selectOptions.length - 1].value).toEqual(mockOption.value);
      expect(selectOptions[selectOptions.length - 1].text).toEqual(mockOption.name);
    });

    it('should escape the name of the option when it is appended', () => {
      const element = industryClassElement();
      element.innerHTML = '';
      const optionWithMaliciousName = { value: '2', name: maliciousOptionTextContent };

      appendSelectOption(element, optionWithMaliciousName);

      const selectOptions = Array.from(element.options);
      expect(selectOptions.length).toEqual(1);
      const appendedOption = selectOptions[0];
      expect(appendedOption.value).toEqual(optionWithMaliciousName.value);
      expect(appendedOption.text).toEqual(optionWithMaliciousName.name);
    });

    it('should escape the value of the option when it is appended', () => {
      const element = industryClassElement();
      element.innerHTML = '';
      const optionWithMaliciousValue = { value: maliciousOptionValue, name: 'test' };

      appendSelectOption(element, optionWithMaliciousValue);

      const selectOptions = Array.from(element.options);
      expect(selectOptions.length).toEqual(1);
      const appendedOption = selectOptions[0];
      expect(appendedOption.value).toEqual(optionWithMaliciousValue.value);
      expect(appendedOption.text).toEqual(optionWithMaliciousValue.name);
    });
  });

  describe('getIndustryClassesFromSectorCode', () => {
    it('should return an industries classes from a given industry sector code', () => {
      const sector200Code = '200';
      const result = getIndustryClassesFromSectorCode(mockSectors, sector200Code);

      expect(result).toEqual([sector200Class12, sector200Class34]);
    });
  });

  describe('changeIndustryClasses', () => {
    it('should render correct array of `industry sector classes` as select options', () => {
      const sector200Code = '200';
      const sector200Event = {
        target: {
          value: sector200Code,
        },
      };

      changeIndustryClasses(sector200Event, mockSectors);

      const element = industryClassElement();
      const selectOptions = Array.from(element.options);

      // empty first select option plus two options for sector200
      const expectedOptionsLength = 3;
      expect(selectOptions.length).toEqual(expectedOptionsLength);
      const [emptyFirstSelectOption, firstSector200Option, secondSector200Option] = selectOptions;
      expect(emptyFirstSelectOption.value).toEqual('');
      expect(emptyFirstSelectOption.text).toEqual('Select value');
      expect(firstSector200Option.value).toEqual(sector200Class12.code);
      expect(firstSector200Option.text).toEqual(sector200Class12.name);
      expect(secondSector200Option.value).toEqual(sector200Class34.code);
      expect(secondSector200Option.text).toEqual(sector200Class34.name);
    });

    it('should escape malicious industry class names and codes', () => {
      const maliciousSectorCode = '500';
      const maliciousClass = {
        code: maliciousOptionValue,
        name: maliciousOptionTextContent,
      };
      const maliciousSector = {
        code: maliciousSectorCode,
        classes: [maliciousClass],
      };
      const maliciousSectorEvent = {
        target: {
          value: maliciousSectorCode,
        },
      };

      changeIndustryClasses(maliciousSectorEvent, [maliciousSector]);

      const element = industryClassElement();
      const selectOptions = Array.from(element.options);

      expect(selectOptions.length).toEqual(2);
      const [emptyFirstSelectOption, maliciousSelectOption] = selectOptions;
      expect(emptyFirstSelectOption.value).toEqual('');
      expect(emptyFirstSelectOption.text).toEqual('Select value');
      expect(maliciousSelectOption.value).toEqual(maliciousClass.code);
      expect(maliciousSelectOption.text).toEqual(maliciousClass.name);
    });
  });
});
