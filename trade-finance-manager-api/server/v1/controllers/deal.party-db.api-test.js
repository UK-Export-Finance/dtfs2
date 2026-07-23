const { isSalesforceCustomerCreationEnabled } = require('@ukef/dtfs2-common');
const { addPartyUrns } = require('./deal.party-db');
const { getPartyDbInfo, getOrCreatePartyDbInfo, updateDeal } = require('../api');

jest.mock('../api', () => ({
  getPartyDbInfo: jest.fn(),
  getOrCreatePartyDbInfo: jest.fn(),
  updateDeal: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isSalesforceCustomerCreationEnabled: jest.fn(),
}));

describe('deal.party-db API tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isSalesforceCustomerCreationEnabled).mockReturnValue(true);
    jest.mocked(updateDeal).mockResolvedValue({ tfm: { parties: {} } });
  });

  it('does not check existing party db info when required salesforce fields are missing', async () => {
    // Arrange
    const deal = {
      _id: 'deal-123',
      tfm: {},
      exporter: {
        companiesHouseRegistrationNumber: '12345678',
        companyName: 'Test Exporter',
        probabilityOfDefault: 0.41,
        selectedIndustry: {},
        registeredAddress: {
          country: 'GBR',
        },
      },
    };

    // Act
    await addPartyUrns(deal, {});

    // Assert
    expect(getPartyDbInfo).not.toHaveBeenCalled();
    expect(getOrCreatePartyDbInfo).not.toHaveBeenCalled();
    expect(updateDeal).toHaveBeenCalledTimes(1);
  });
});
