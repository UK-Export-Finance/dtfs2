/* eslint-disable no-underscore-dangle */
const { TFM_FACILITY_STAGE } = require('@ukef/dtfs2-common');
const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/facilities/_macros/facilities-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    facilities: [
      {
        dealId: '123',
        facilityId: '123',
        ukefFacilityId: '10000001',
        dealType: 'BSS/EWCS',
        type: 'Bond',
        value: 1234567890,
        currency: 'GBP',
        coverEndDate: '11 Apr 2024',
        companyName: 'Company 1',
        hasBeenIssued: true,
        coverEndDateEpoch: 1712793600,
        currencyAndValue: 'GBP 1,234,567,890.1',
        hasAmendmentInProgress: true,
      },
      {
        dealId: '456',
        facilityId: '456',
        ukefFacilityId: '10000002',
        dealType: 'BSS/EWCS',
        type: 'Bond',
        value: 1234567890,
        currency: 'GBP',
        coverEndDate: '11 Apr 2024',
        companyName: 'Company 1',
        hasBeenIssued: true,
        coverEndDateEpoch: 1712793600,
        currencyAndValue: 'GBP 1,234,567,890.1',
        hasAmendmentInProgress: true,
      },
    ],
    user: {
      timezone: 'Europe/London',
    },
    sortButtonWasClicked: true,
    activeSortByField: 'ukefFacilityId',
    activeSortByOrder: 'ascending',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('table headings', () => {
    it('should render `facility id` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-ukefFacilityId"]').toRead('Facility ID');
      wrapper.expectAriaSort('[data-cy="facilities-table-heading-ukefFacilityId"]').toEqual('ascending');
      wrapper.expectElement('[data-cy="facilities-table-heading-ukefFacilityId-button"]').toHaveAttribute('autofocus', 'autofocus');
    });

    it('should render `product` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-dealType"]').toRead('Product');
      wrapper.expectAriaSort('[data-cy="facilities-table-heading-dealType"]').toEqual('none');
      wrapper.expectElement('[data-cy="facilities-table-heading-dealType-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `type` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-type"]').toRead('Type');
      wrapper.expectAriaSort('[data-cy="facilities-table-heading-type"]').toEqual('none');
      wrapper.expectElement('[data-cy="facilities-table-heading-type-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `exporter` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-companyName"]').toRead('Exporter');
      wrapper.expectAriaSort('[data-cy="facilities-table-heading-companyName"]').toEqual('none');
      wrapper.expectElement('[data-cy="facilities-table-heading-companyName-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `value (export currency)` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-value"]').toRead('Value (export currency)');
      wrapper.expectAriaSort('[data-cy="facilities-table-heading-value"]').toEqual('none');
      wrapper.expectElement('[data-cy="facilities-table-heading-value-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `cover end date` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-coverEndDate"]').toRead('Cover end date');
      wrapper.expectAriaSort('[data-cy="facilities-table-heading-coverEndDate"]').toEqual('none');
      wrapper.expectElement('[data-cy="facilities-table-heading-coverEndDate-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `facility stage` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-facilityStage"]').toRead('Facility stage');
      wrapper.expectAriaSort('[data-cy="facilities-table-heading-facilityStage"]').toEqual('none');
      wrapper.expectElement('[data-cy="facilities-table-heading-facilityStage-button"]').toHaveAttribute('autofocus', undefined);
    });
  });

  describe('for each facility', () => {
    it('should render ukefFacilityId link, linking to facility id', () => {
      params.facilities.forEach((facility) => {
        const selector = `[data-cy="facility-${facility.facilityId}-ukefFacilityId-link"]`;

        wrapper.expectLink(selector).toLinkTo(`/case/${facility.dealId}/facility/${facility.facilityId}`, `View facility ${facility.ukefFacilityId} details`);
      });
    });

    it('should render `product` table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility.facilityId}-dealType"]`;
        wrapper.expectText(cellSelector).toRead(facility.dealType);
      });
    });

    it('should render `type` table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility.facilityId}-type"]`;
        wrapper.expectText(cellSelector).toRead(facility.type);
      });
    });

    it('should render `exporter` table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility.facilityId}-companyName"]`;
        wrapper.expectText(cellSelector).toRead(facility.companyName);
      });
    });

    it('should render `value (export currency)` table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility.facilityId}-value"]`;
        wrapper.expectText(cellSelector).toRead(facility.currencyAndValue);
      });
    });

    it('should render `cover end date` table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility.facilityId}-coverEndDate"]`;
        wrapper.expectText(cellSelector).toRead(facility.coverEndDate);
      });
    });

    describe('`facility stage` table cell', () => {
      describe('when the facility has a tfm facility stage', () => {
        it('should render the tfm facility stage', () => {
          const facilityWithTfmStage = {
            ...params.facilities[0],
            tfmFacilityStage: TFM_FACILITY_STAGE.RISK_EXPIRED,
          };

          const paramsWithTfmFacilityStage = {
            facilities: [facilityWithTfmStage],
            user: params.user,
          };

          wrapper = render(paramsWithTfmFacilityStage);

          paramsWithTfmFacilityStage.facilities.forEach((facility) => {
            const cellSelector = `[data-cy="facility-${facility.facilityId}-facilityStage"]`;
            wrapper.expectText(cellSelector).toRead(TFM_FACILITY_STAGE.RISK_EXPIRED);
          });
        });
      });

      describe('when the facility has been issued', () => {
        describe('when the facility has an amendment in progress', () => {
          const issuedFacilityWithAmendmentInProgress = {
            ...params.facilities[0],
          };

          const paramsIssuedWithAmendmentInProgress = {
            facilities: [issuedFacilityWithAmendmentInProgress],
            user: params.user,
          };

          beforeEach(() => {
            wrapper = render(paramsIssuedWithAmendmentInProgress);
          });

          it('should render `Issued (amendment in progress)`', () => {
            paramsIssuedWithAmendmentInProgress.facilities.forEach((facility) => {
              const cellSelector = `[data-cy="facility-${facility.facilityId}-facilityStage"]`;
              wrapper.expectText(cellSelector).toMatch(/Issued\s*\(amendment in progress\)/);
            });
          });
        });

        describe('when the facility does not have an amendment in progress', () => {
          const issuedFacilityWithoutAmendmentInProgress = {
            ...params.facilities[0],
            hasAmendmentInProgress: false,
          };

          const paramsIssuedWithoutAmendmentInProgress = {
            facilities: [issuedFacilityWithoutAmendmentInProgress],
            user: params.user,
          };

          beforeEach(() => {
            wrapper = render(paramsIssuedWithoutAmendmentInProgress);
          });

          it('should render `Issued`', () => {
            paramsIssuedWithoutAmendmentInProgress.facilities.forEach((facility) => {
              const cellSelector = `[data-cy="facility-${facility.facilityId}-facilityStage"]`;
              wrapper.expectText(cellSelector).toRead('Issued');
            });
          });
        });
      });

      describe('when the facility has not been issued', () => {
        describe('when the facility has an amendment in progress', () => {
          const unissuedFacilityWithAmendmentInProgress = {
            ...params.facilities[0],
            hasBeenIssued: false,
          };

          const paramsUnissuedWithAmendmentInProgress = {
            facilities: [unissuedFacilityWithAmendmentInProgress],
            user: params.user,
          };

          beforeEach(() => {
            wrapper = render(paramsUnissuedWithAmendmentInProgress);
          });

          it('should render `Unissued (amendment in progress)`', () => {
            paramsUnissuedWithAmendmentInProgress.facilities.forEach((facility) => {
              const cellSelector = `[data-cy="facility-${facility.facilityId}-facilityStage"]`;
              wrapper.expectText(cellSelector).toMatch(/Unissued\s*\(amendment in progress\)/);
            });
          });
        });

        describe('when the facility does not have an amendment in progress', () => {
          const unissuedFacilityWithoutAmendmentInProgress = {
            ...params.facilities[0],
            hasBeenIssued: false,
            hasAmendmentInProgress: false,
          };

          const paramsUnissuedWithoutAmendmentInProgress = {
            facilities: [unissuedFacilityWithoutAmendmentInProgress],
            user: params.user,
          };

          beforeEach(() => {
            wrapper = render(paramsUnissuedWithoutAmendmentInProgress);
          });

          it('should render `Unissued`', () => {
            paramsUnissuedWithoutAmendmentInProgress.facilities.forEach((facility) => {
              const cellSelector = `[data-cy="facility-${facility.facilityId}-facilityStage"]`;
              wrapper.expectText(cellSelector).toRead('Unissued');
            });
          });
        });
      });
    });
  });

  describe('footer headings', () => {
    it('should render Cookies heading Contact Us', () => {
      wrapper.expectText('[data-cy="contact-us-footer"]').toRead('');
    });

    it('should render Cookies link under Contact Us', () => {
      wrapper.expectText('[data-cy="cookies-link"]').toRead('');
    });
    it('should render Accessibility Statement link under Contact Us', () => {
      wrapper.expectText('[data-cy="accessibility-statement-link"]').toRead('');
    });
  });
});
