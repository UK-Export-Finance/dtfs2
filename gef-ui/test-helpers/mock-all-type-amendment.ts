import {
  PORTAL_AMENDMENT_STATUS,
  AMENDMENT_TYPES,
  AmendmentsEligibilityCriterionWithAnswer,
  UnixTimestampSeconds,
  PortalAmendmentStatus,
  UnixTimestampMilliseconds,
  TfmAmendmentStatus,
} from '@ukef/dtfs2-common';

import { FacilityAmendmentWithUkefId } from '../server/constants/amendments';

export class FacilityAmendmentWithUkefIdMockBuilder {
  private readonly amendment: FacilityAmendmentWithUkefId;

  public constructor(amendment?: FacilityAmendmentWithUkefId) {
    this.amendment = amendment ?? {
      dealId: '6776cb6f3e2efb60a50fbc3d',
      facilityId: '6776cb6f3e2efb60a50fbc41',
      amendmentId: '6777c4ca826649ec990c1adf',
      type: AMENDMENT_TYPES.PORTAL,
      status: PORTAL_AMENDMENT_STATUS.DRAFT,
      createdBy: {
        username: 'maker1@ukexportfinance.gov.uk',
        name: 'First Last',
        email: 'maker1@ukexportfinance.gov.uk',
      },
      ukefFacilityId: '0041282190',
      eligibilityCriteria: {
        version: 1,
        criteria: [
          {
            id: 1,
            text: 'Criteria 1',
            answer: null,
          },
        ],
      },
    };
  }

  public withFacilityId(facilityId: string) {
    this.amendment.facilityId = facilityId;
    return this;
  }

  public withDealId(dealId: string) {
    this.amendment.dealId = dealId;
    return this;
  }

  public withAmendmentId(amendmentId: string) {
    this.amendment.amendmentId = amendmentId;
    return this;
  }

  public withCriteria(criteria: AmendmentsEligibilityCriterionWithAnswer[]) {
    this.amendment.eligibilityCriteria = {
      version: 1,
      criteria,
    };
    return this;
  }

  public withChangeCoverEndDate(changeCoverEndDate: boolean) {
    this.amendment.changeCoverEndDate = changeCoverEndDate;
    return this;
  }

  public withChangeFacilityValue(changeFacilityValue: boolean) {
    this.amendment.changeFacilityValue = changeFacilityValue;
    return this;
  }

  public withIsUsingFacilityEndDate(isUsingFacilityEndDate: boolean) {
    this.withChangeCoverEndDate(true);
    this.amendment.isUsingFacilityEndDate = isUsingFacilityEndDate;

    if (isUsingFacilityEndDate) {
      delete this.amendment.bankReviewDate;
    } else {
      delete this.amendment.facilityEndDate;
    }

    return this;
  }

  public withFacilityValue(facilityValue: number) {
    this.withChangeFacilityValue(true);
    this.amendment.value = facilityValue;
    return this;
  }

  public withFacilityEndDate(facilityEndDate: Date) {
    this.withIsUsingFacilityEndDate(true);
    this.amendment.facilityEndDate = facilityEndDate;
    return this;
  }

  public withBankReviewDate(bankReviewDate: Date) {
    this.withIsUsingFacilityEndDate(false);
    this.amendment.bankReviewDate = bankReviewDate;
    return this;
  }

  public withCoverEndDate(coverEndDate: UnixTimestampMilliseconds) {
    this.withChangeCoverEndDate(true);
    this.amendment.coverEndDate = coverEndDate;
    return this;
  }

  public withEffectiveDate(effectiveDate: UnixTimestampSeconds) {
    this.amendment.effectiveDate = effectiveDate;
    return this;
  }

  public withStatus(status: PortalAmendmentStatus | TfmAmendmentStatus) {
    this.amendment.status = status;
    return this;
  }

  public withReferenceNumber(referenceNumber: string) {
    this.amendment.referenceNumber = referenceNumber;
    return this;
  }

  public build() {
    return this.amendment;
  }
}
