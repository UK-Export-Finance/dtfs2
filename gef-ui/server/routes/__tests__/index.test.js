import mandatoryCriteriaRoutes from '../mandatory-criteria';
import nameApplicationRoutes from '../name-application';
import ineligibleRoutes from '../ineligible';
import applicationDetailsRoutes from '../application-details';

const useSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      use: useSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../index');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup all routes', () => {
    expect(useSpy).toHaveBeenCalledWith(mandatoryCriteriaRoutes);
    expect(useSpy).toHaveBeenCalledWith(nameApplicationRoutes);
    expect(useSpy).toHaveBeenCalledWith(ineligibleRoutes);
    expect(useSpy).toHaveBeenCalledWith(applicationDetailsRoutes);
  });
});
