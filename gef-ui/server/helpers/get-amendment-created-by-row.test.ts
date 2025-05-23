import { PORTAL_AMENDMENT_STATUS, TFM_AMENDMENT_STATUS, DATE_FORMATS, FacilityAllTypeAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { format, fromUnixTime, getUnixTime, startOfDay } from 'date-fns';
import { getAmendmentCreatedByRow } from './get-amendment-created-by-row';
import { FacilityAmendmentWithUkefIdMockBuilder } from '../../test-helpers/mock-all-type-amendment';

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const today = startOfDay(new Date());

describe('getAmendmentCreatedByRow', () => {
  const facilityEndDate = new Date();
  const bankReviewDate = new Date();
  const coverEndDate = Number(new Date());
  const referenceNumber = 'ukefFacilityId-01';

  const portalAmendment: FacilityAllTypeAmendmentWithUkefId = new FacilityAmendmentWithUkefIdMockBuilder()
    .withDealId(dealId)
    .withFacilityId(facilityId)
    .withAmendmentId(amendmentId)
    .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
    .withIsUsingFacilityEndDate(true)
    .withFacilityEndDate(facilityEndDate)
    .withCoverEndDate(coverEndDate)
    .withEffectiveDate(getUnixTime(today))
    .withReferenceNumber(referenceNumber)
    .build();

  const portalExpectedResult = [
    { key: { text: 'Facility ID' }, value: { text: portalAmendment.ukefFacilityId } },
    { key: { text: 'Status' }, value: { text: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED } },
    {
      key: { text: 'New cover end date' },
      value: { text: portalAmendment.coverEndDate ? format(portalAmendment.coverEndDate, DATE_FORMATS.DD_MMMM_YYYY) : '' },
    },
    {
      key: { text: 'New facility end date' },
      value: { text: portalAmendment.facilityEndDate ? format(new Date(portalAmendment.facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY) : '' },
    },
    {
      key: { text: 'Date effective from' },
      value: { text: portalAmendment.effectiveDate ? format(fromUnixTime(portalAmendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY) : '' },
    },
    { key: { text: 'Amendment created by' }, value: { text: portalAmendment.createdBy ? portalAmendment.createdBy.name : null } },
  ];

  const tfmAmendment: FacilityAllTypeAmendmentWithUkefId = new FacilityAmendmentWithUkefIdMockBuilder()
    .withDealId(dealId)
    .withFacilityId(facilityId)
    .withAmendmentId(amendmentId)
    .withStatus(TFM_AMENDMENT_STATUS.COMPLETED)
    .withIsUsingFacilityEndDate(false)
    .withBankReviewDate(bankReviewDate)
    .withCoverEndDate(coverEndDate)
    .withEffectiveDate(getUnixTime(today))
    .withReferenceNumber(referenceNumber)
    .build();

  const tfmExpectedResult = [
    { key: { text: 'Facility ID' }, value: { text: tfmAmendment.ukefFacilityId } },
    { key: { text: 'Status' }, value: { text: TFM_AMENDMENT_STATUS.COMPLETED } },
    {
      key: { text: 'New cover end date' },
      value: { text: tfmAmendment.coverEndDate ? format(tfmAmendment.coverEndDate, DATE_FORMATS.DD_MMMM_YYYY) : '' },
    },
    {
      key: { text: 'New bank review date' },
      value: { text: tfmAmendment.bankReviewDate ? format(new Date(tfmAmendment.bankReviewDate), DATE_FORMATS.DD_MMMM_YYYY) : '' },
    },
    {
      key: { text: 'Date effective from' },
      value: { text: tfmAmendment.effectiveDate ? format(fromUnixTime(tfmAmendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY) : '' },
    },
    { key: { text: 'Amendment created by' }, value: { text: tfmAmendment.createdBy ? tfmAmendment.createdBy.name : null } },
  ];

  it('should map portal amendment rows', () => {
    // Act
    const result = getAmendmentCreatedByRow(portalAmendment);

    // Assert
    expect(result).toEqual(portalExpectedResult);
  });

  it('should map a tfm amendment rows', () => {
    // Act
    const result = getAmendmentCreatedByRow(tfmAmendment);

    // Assert
    expect(result).toEqual(tfmExpectedResult);
  });
});
