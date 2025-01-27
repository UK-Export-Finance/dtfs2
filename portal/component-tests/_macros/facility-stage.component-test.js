const { FACILITY_STAGE } = require('@ukef/dtfs2-common');
const componentRender = require('../componentRenderer');

const component = '_macros/facility-stage.njk';
const render = componentRender(component);
const facilities = require('../fixtures/deal-fully-completed');

describe('_macros/facility-stage.njk', () => {
  it(`should render facility stage as ${FACILITY_STAGE.ISSUED}, where facility has been issued.`, () => {
    // Act
    const wrapper = render(facilities.loanTransactions.items[0]);

    // Assert
    expect(wrapper.html).toContain(FACILITY_STAGE.ISSUED);
  });

  it(`should render facility stage as ${FACILITY_STAGE.UNISSUED}, where facility has not been issued`, () => {
    // Act
    const wrapper = render(facilities.loanTransactions.items[1]);

    // Assert
    expect(wrapper.html).toContain(FACILITY_STAGE.UNISSUED);
  });

  it(`should render facility stage as ${FACILITY_STAGE.UNISSUED}, with an empty facility object`, () => {
    // Act
    const wrapper = render(facilities.loanTransactions.items[3]);

    // Assert
    expect(wrapper.html).toContain(FACILITY_STAGE.UNISSUED);
  });

  it(`should render facility stage as ${FACILITY_STAGE.RISK_EXPIRED}`, () => {
    // Act
    const wrapper = render(facilities.loanTransactions.items[2]);

    // Assert
    expect(wrapper.html).toContain(FACILITY_STAGE.RISK_EXPIRED);
  });
});
