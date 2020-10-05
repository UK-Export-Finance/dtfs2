import * as showHideElement from './show-hide-element';
import * as maskedInputs from './masked-inputs';
import * as changeIndustryClasses from './change-industry-classes';
import * as number from './number';
import main from './main';

jest.mock('govuk-frontend');


describe('main.js', () => {
  it('should call showHideElement()', () => {
    showHideElement.default = jest.fn();
    main();
    expect(showHideElement.default).toHaveBeenCalled();
  });

  it('should call changeIndustryClasses()', () => {
    changeIndustryClasses.default = jest.fn();
    main();
    expect(changeIndustryClasses.default).toHaveBeenCalled();
  });

  it('should call number()', () => {
    number.default = jest.fn();
    main();
    expect(number.default).toHaveBeenCalled();
  });
});
