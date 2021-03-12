import mandatoryCriteriaRoutes from '../mandatory-criteria';
import nameApplicationRoutes from '../name-application';
import ineligibleGefRoutes from '../ineligible-gef';
import ineligibleAutomaticCoverRoutes from '../ineligible-automatic-cover';
import automaticCoverRoutes from '../automatic-cover';
import applicationDetailsRoutes from '../application-details';
import companiesHouseRoutes from '../companies-house';

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
    expect(useSpy).toHaveBeenCalledWith(ineligibleGefRoutes);
    expect(useSpy).toHaveBeenCalledWith(ineligibleAutomaticCoverRoutes);
    expect(useSpy).toHaveBeenCalledWith(automaticCoverRoutes);
    expect(useSpy).toHaveBeenCalledWith(applicationDetailsRoutes);
    expect(useSpy).toHaveBeenCalledWith(companiesHouseRoutes);
  });
});
