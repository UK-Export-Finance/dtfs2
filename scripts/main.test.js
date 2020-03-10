jest.mock('govuk-frontend');
import * as govukFrontend from 'govuk-frontend';
import * as numericFloatInputs from './numeric-float-inputs';
import main from './main';


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

});
