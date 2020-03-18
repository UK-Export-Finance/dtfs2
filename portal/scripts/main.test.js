import * as govukFrontend from 'govuk-frontend';
import * as numericFloatInputs from './numeric-float-inputs';
import * as changeIndustryClasses from './change-industry-classes';
import main from './main';

jest.mock('govuk-frontend');


describe('main.js', () => {
  it('should call initAll() from govuk-frontend', () => {
    const spy = jest.spyOn(govukFrontend, 'initAll');
    main();
    expect(spy).toHaveBeenCalled();
  });

  it('should call numericFloatInputs()', () => {
    numericFloatInputs.default = jest.fn();
    main();
    expect(numericFloatInputs.default).toHaveBeenCalled();
  });

  it('should call changeIndustryClasses()', () => {
    changeIndustryClasses.default = jest.fn();
    main();
    expect(changeIndustryClasses.default).toHaveBeenCalled();
  });
});
