import { TfmFacility } from '@ukef/dtfs2-common';

type MapFacilitiesToSendToGiftParams = {
  dealId: string;
  giftFacilities: object[] | false;
  issuedTfmFacilities: TfmFacility[];
};

type MapFacilitiesToSendToGiftReturnShape = {
  facilitiesToSendToApimGift: TfmFacility[];
  facilityIds?: string[];
};

type GiftFacility = {
  facilityId: string;
};

/**
 * Type guard to check if an object is a GiftFacility / has a GIFT facilityId property.
 * @param facility - The object to check.
 * @returns True if the object has a facilityId property, false otherwise.
 */
export const hasGiftFacilityId = (facility: object): facility is GiftFacility => 'facilityId' in facility;

/**
 * Map issued TFM facilities to determine which can be sent to APIM GIFT based on whether they already exist in GIFT.
 * @param {MapFacilitiesToSendToGiftParams} params - An object containing the deal ID, facilities found in GIFT, and issued TFM facilities.
 * @param {string} params.dealId - The ID of the deal for logging purposes.
 * @param {object[] | false} params.giftFacilities - The facilities found in GIFT for the deal, or false if the GIFT lookup failed.
 * @param {TfmFacility[]} params.issuedTfmFacilities - The issued TFM facilities for the deal.
 * @returns {MapFacilitiesToSendToGiftReturnShape} An object containing the facilities that can be sent to APIM GIFT (i.e., those that do not already exist in GIFT).
 */
export const mapFacilitiesToSendToGift = ({
  dealId,
  giftFacilities,
  issuedTfmFacilities,
}: MapFacilitiesToSendToGiftParams): MapFacilitiesToSendToGiftReturnShape => {
  console.info('Mapping issued facilities for deal %s to determine if any should be sent to APIM GIFT', dealId);

  if (giftFacilities === false) {
    console.info('Failed to retrieve existing GIFT facilities for deal %s - no issued facilities will be submitted to APIM GIFT', dealId);

    return {
      facilitiesToSendToApimGift: [],
      facilityIds: [],
    };
  }

  const giftFacilityIds = new Set(giftFacilities.filter(hasGiftFacilityId).map((facility) => String(facility.facilityId)));

  if (giftFacilityIds.size === 0) {
    console.info('No facilities found in APIM GIFT for deal %s - all issued facilities can be submitted to APIM GIFT', dealId);

    return {
      facilitiesToSendToApimGift: issuedTfmFacilities,
    };
  }

  /**
   * Some GIFT facilities found with the provided IDs.
   * Only facilities that are NOT in GIFT can be sent to APIM GIFT.
   */
  const facilitiesInGift = issuedTfmFacilities.filter(({ facilitySnapshot: { ukefFacilityId } }) => giftFacilityIds.has(String(ukefFacilityId)));
  const facilitiesNotInGift = issuedTfmFacilities.filter(({ facilitySnapshot: { ukefFacilityId } }) => !giftFacilityIds.has(String(ukefFacilityId)));

  const facilitiesInGiftIds = facilitiesInGift.map((facility) => facility.facilitySnapshot.ukefFacilityId);
  const facilitiesNotInGiftIds = facilitiesNotInGift.map((facility) => String(facility.facilitySnapshot.ukefFacilityId));

  if (facilitiesInGiftIds.length === issuedTfmFacilities.length) {
    console.info('All issued facilities for deal %s already exist in GIFT: %o', dealId, facilitiesInGiftIds);

    return {
      facilitiesToSendToApimGift: [],
      facilityIds: [],
    };
  }

  console.info('Some issued facilities for deal %s already exist in GIFT: %o', dealId, facilitiesInGiftIds);

  if (facilitiesNotInGiftIds.length) {
    console.info('Some issued facilities for deal %s do not exist in GIFT: %o', dealId, facilitiesNotInGiftIds);
  }

  return {
    facilitiesToSendToApimGift: facilitiesNotInGift,
    facilityIds: facilitiesNotInGiftIds,
  };
};
