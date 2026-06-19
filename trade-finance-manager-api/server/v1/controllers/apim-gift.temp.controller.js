const { HttpStatusCode } = require('axios');
const { DEAL_SUBMISSION_TYPE, DEAL_TYPE, isTfmApimGiftIntegrationEnabled } = require('@ukef/dtfs2-common');
const { canSendToApimGift, sendFacilitiesToApimGift } = require('../integrations/apim-gift');
const { mapFacilitiesToSendToGift } = require('../integrations/apim-gift/map-facilities-to-send-to-gift');
const { getReferenceData } = require('../integrations/apim-gift/send-facilities-to-apim-gift/get-reference-data');
const { APIM_GIFT_PAYLOADS } = require('../mappings/apim-gift-payloads');
const api = require('../api');

const getDiagnostics = async (deal) => {
  const dealId = String(deal?._id || '');
  const dealType = deal?.dealSnapshot?.dealType;
  const submissionType = deal?.dealSnapshot?.submissionType;

  const isFeatureFlagEnabled = isTfmApimGiftIntegrationEnabled();
  const isBssEwcsDeal = dealType === DEAL_TYPE.BSS_EWCS;
  const isGefDeal = dealType === DEAL_TYPE.GEF;
  const validDealType = isBssEwcsDeal || isGefDeal;
  const validSubmissionType = submissionType === DEAL_SUBMISSION_TYPE.AIN || submissionType === DEAL_SUBMISSION_TYPE.MIN;
  const hasExporterCreditRating = Boolean(deal?.tfm?.exporterCreditRating?.trim());
  const hasTfmBuyerPartyUrn = Boolean(deal?.tfm?.parties?.buyer?.partyUrn);
  const isValidBssEwcsDeal = isBssEwcsDeal && hasTfmBuyerPartyUrn;

  let facilitiesLookupSucceeded = false;
  let giftLookupSucceeded = false;
  let issuedFacilitiesCount = 0;
  let giftFacilitiesFoundCount = 0;
  let facilitiesToSendCount = 0;

  let facilities = [];

  if (isFeatureFlagEnabled && validDealType && validSubmissionType && hasExporterCreditRating && (isValidBssEwcsDeal || isGefDeal)) {
    try {
      const facilitiesResponse = await api.findFacilitiesByDealId(dealId);
      facilitiesLookupSucceeded = true;
      facilities = Array.isArray(facilitiesResponse) ? facilitiesResponse : [];
    } catch {
      facilitiesLookupSucceeded = false;
      facilities = [];
    }

    const issuedFacilities = facilities.filter((facility) => Boolean(facility?.facilitySnapshot?.hasBeenIssued));
    issuedFacilitiesCount = issuedFacilities.length;

    if (issuedFacilitiesCount > 0) {
      const issuedFacilityIds = issuedFacilities.map((facility) => String(facility.facilitySnapshot.ukefFacilityId)).join(',');

      const giftFacilitiesResponse = await api.findGiftFacilitiesByIds(issuedFacilityIds);

      if (giftFacilitiesResponse !== false) {
        giftLookupSucceeded = true;
        const giftFacilities = Array.isArray(giftFacilitiesResponse.facilities) ? giftFacilitiesResponse.facilities : [];
        giftFacilitiesFoundCount = giftFacilities.length;

        const { facilitiesToSendToApimGift } = mapFacilitiesToSendToGift({
          dealId,
          giftFacilities,
          issuedTfmFacilities: issuedFacilities,
        });

        facilitiesToSendCount = facilitiesToSendToApimGift.length;
      }
    }
  }

  const hasIssuedFacilities = issuedFacilitiesCount > 0;
  const allIssuedFacilitiesAlreadyInGift = hasIssuedFacilities && giftLookupSucceeded && facilitiesToSendCount === 0;

  const reasonFlags = {
    featureFlagDisabled: !isFeatureFlagEnabled,
    invalidDealType: !validDealType,
    invalidSubmissionType: !validSubmissionType,
    missingExporterCreditRating: !hasExporterCreditRating,
    missingBssEwcsBuyerPartyUrn: isBssEwcsDeal && !hasTfmBuyerPartyUrn,
    facilitiesLookupFailed: !facilitiesLookupSucceeded,
    noIssuedFacilities: facilitiesLookupSucceeded && !hasIssuedFacilities,
    giftLookupFailed: hasIssuedFacilities && !giftLookupSucceeded,
    allIssuedFacilitiesAlreadyInGift,
  };

  const failureReasons = Object.entries(reasonFlags)
    .filter(([, flag]) => flag)
    .map(([reason]) => reason);

  return {
    isFeatureFlagEnabled,
    dealType,
    submissionType,
    validDealType,
    validSubmissionType,
    isBssEwcsDeal,
    isGefDeal,
    hasExporterCreditRating,
    hasTfmBuyerPartyUrn,
    isValidBssEwcsDeal,
    facilitiesLookupSucceeded,
    hasIssuedFacilities,
    issuedFacilitiesCount,
    giftLookupSucceeded,
    giftFacilitiesFoundCount,
    facilitiesToSendCount,
    allIssuedFacilitiesAlreadyInGift,
    failureReasons,
  };
};

/**
 * Temporary local testing endpoint.
 * Intentionally exposed on openRouter (API key only) so JWT auth can be bypassed locally.
 */
const sendFacilitiesToApimGiftTemp = async (req, res) => {
  try {
    const { deal, facility, newPartyUrnCreated = false } = req.body || {};

    if (!deal || !facility) {
      return res.status(HttpStatusCode.BadRequest).send({ data: 'Request body must include deal and facility' });
    }

    const diagnostics = await getDiagnostics(deal);

    const { canSendFacilitiesToApimGift, isBssEwcsDeal, isGefDeal } = await canSendToApimGift(deal);
    let facilityPayload = null;

    if (!canSendFacilitiesToApimGift) {
      return res.status(HttpStatusCode.Ok).send({
        canSendFacilitiesToApimGift: false,
        sentToApimGift: false,
        facilitiesSent: 0,
        facilityPayload,
        ...diagnostics,
      });
    }

    const { facilityCategories, creditRiskRatings } = await getReferenceData(isGefDeal);

    facilityPayload = await APIM_GIFT_PAYLOADS.createFacility({
      creditRiskRatings,
      deal,
      facility,
      facilityCategories,
      isBssEwcsDeal,
      isGefDeal,
      newPartyUrnCreated,
    });

    const sendResult = await sendFacilitiesToApimGift({
      deal,
      facilities: [facility],
      isBssEwcsDeal,
      isGefDeal,
      newPartyUrnCreated,
    });

    // eslint-disable-next-line no-nested-ternary
    const facilitiesSent = Array.isArray(sendResult) ? sendResult.length : sendResult ? 1 : 0;

    return res.status(HttpStatusCode.Ok).send({
      canSendFacilitiesToApimGift: true,
      sentToApimGift: facilitiesSent > 0,
      facilitiesSent,
      facilityPayload,
      ...diagnostics,
      sendResult,
    });
  } catch (error) {
    console.error('Temporary APIM GIFT send endpoint failed for deal %s %o', req.body?.deal?._id, error);

    return res.status(HttpStatusCode.InternalServerError).send({ data: 'Unable to send facilities to APIM GIFT' });
  }
};

module.exports = {
  sendFacilitiesToApimGiftTemp,
};
