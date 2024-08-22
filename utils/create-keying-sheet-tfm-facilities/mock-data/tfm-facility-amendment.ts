import { ObjectId } from 'mongodb';
import { faker } from '@faker-js/faker';
import { addMonths } from 'date-fns';
import { AMENDMENT_STATUS, TfmFacilityAmendment, UnixTimestamp } from '@ukef/dtfs2-common';

const TODAY = new Date();

const EARLIEST_COVER_END_DATE = addMonths(TODAY, 12);
const getRandomCoverEndDateTimestamp = (): UnixTimestamp => faker.date.future({ years: 2, refDate: EARLIEST_COVER_END_DATE }).getTime();

const getRandomAmendmentStatus = () => faker.helpers.arrayElement(Object.values(AMENDMENT_STATUS));

export const aTfmFacilityAmendmentWithFacilityIdAndDealId = (facilityId: ObjectId, dealId: ObjectId): TfmFacilityAmendment => {
  const amendment: TfmFacilityAmendment = {
    facilityId,
    dealId,
    amendmentId: new ObjectId(),
    createdAt: TODAY.getTime(),
    updatedAt: TODAY.getTime(),
    status: getRandomAmendmentStatus(),
    version: 0,
  };

  amendment.changeCoverEndDate = faker.helpers.arrayElement([true, false]);
  if (amendment.changeCoverEndDate) {
    amendment.coverEndDate = getRandomCoverEndDateTimestamp();
  }

  return amendment;
};
