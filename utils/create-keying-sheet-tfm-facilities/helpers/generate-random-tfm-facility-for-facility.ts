import { WithoutId } from 'mongodb';
import { faker } from '@faker-js/faker';
import { Facility, TfmFacility, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { aTfmFacilityAmendmentWithFacilityIdAndDealId } from '../mock-data';

const generateRandomTfmFacilityAmendmentsForFacility = (facility: Facility): TfmFacilityAmendment[] | undefined => {
  const numberToGenerate = faker.number.int({ min: 0, max: 3 });
  if (numberToGenerate === 0) {
    return undefined;
  }

  const amendments: TfmFacilityAmendment[] = [];
  while (amendments.length < numberToGenerate) {
    amendments.push(aTfmFacilityAmendmentWithFacilityIdAndDealId(facility._id, facility.dealId));
  }
  return amendments;
};

export const generateRandomTfmFacilityForFacility = (facility: Facility): WithoutId<TfmFacility> => {
  const tfmFacility: WithoutId<TfmFacility> = { facilitySnapshot: facility, tfm: {} };

  const amendments = generateRandomTfmFacilityAmendmentsForFacility(facility);
  if (amendments) {
    return { ...tfmFacility, amendments };
  }

  return tfmFacility;
};
