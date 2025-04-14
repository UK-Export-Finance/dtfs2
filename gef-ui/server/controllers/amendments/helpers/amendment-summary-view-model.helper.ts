import { format, fromUnixTime } from 'date-fns';
import { DATE_FORMATS, PortalFacilityAmendmentWithUkefId, SummaryListRow, getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { getAmendmentsUrl } from './navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { Facility } from '../../../types/facility';

/**
 * generates change link if renderChangeLink is true
 * takes href, visuallyHiddenText string, datacy to generate change link
 * @param param.href - the constructed href for change link
 * @param param.visuallyHiddenText - text for visuallyHiddenText
 * @param param.datacy - the data-cy for the change link
 * @param param.renderChangeLink - if the change link should be constructed
 * @returns constructed change link in an array if renderChangeLink is true or empty array
 */
export const generateChangeLink = ({
  href,
  visuallyHiddenText,
  datacy,
  renderChangeLink = true,
}: {
  href: string;
  visuallyHiddenText: string;
  datacy: string;
  renderChangeLink: boolean;
}) => {
  if (renderChangeLink) {
    return [
      {
        href,
        text: 'Change',
        visuallyHiddenText,
        attributes: {
          'data-cy': datacy,
        },
      },
    ];
  }

  return [];
};

/**
 * @param amendment - the amendment
 * @param renderChangeLink - if change link should be rendered - defaults to true
 * @returns the SummaryListRows containing `New facility end date` or `New bank review date`
 */
const generateFacilityEndDateSummaryRows = (amendment: PortalFacilityAmendmentWithUkefId, renderChangeLink = true): SummaryListRow[] => {
  const bankReviewDate = amendment.bankReviewDate ? new Date(amendment.bankReviewDate) : null;

  if (amendment.isUsingFacilityEndDate) {
    const facilityEndDate = amendment.facilityEndDate ? new Date(amendment.facilityEndDate) : null;

    return [
      {
        key: {
          text: 'New facility end date',
          classes: 'amendment-facility-end-date-key',
        },
        value: {
          text: facilityEndDate ? format(facilityEndDate, DATE_FORMATS.D_MMMM_YYYY) : '-',
          classes: 'amendment-facility-end-date-value',
        },
        actions: {
          items: generateChangeLink({
            href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE })}/?change=true#facilityEndDate-day`,
            visuallyHiddenText: 'facility end date',
            datacy: 'change-facility-end-date-link',
            renderChangeLink,
          }),
        },
      },
    ];
  }

  return [
    {
      key: {
        text: 'New bank review date',
        classes: 'amendment-bank-review-date-key',
      },
      value: {
        text: bankReviewDate ? format(bankReviewDate, DATE_FORMATS.D_MMMM_YYYY) : '-',
        classes: 'amendment-bank-review-date-value',
      },
      actions: {
        items: generateChangeLink({
          href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE })}/?change=true#bankReviewDate-day`,
          visuallyHiddenText: 'bank review date',
          datacy: 'change-bank-review-date-link',
          renderChangeLink,
        }),
      },
    },
  ];
};

/**
 * @param amendment - Amendment object
 * @param facility - Facility object
 * @param renderChangeLink - if change link should be rendered - defaults to true
 * @returns the SummaryListRows for the Cover end date section
 */
const generateCoverEndDateSummaryRows = (amendment: PortalFacilityAmendmentWithUkefId, facility: Facility, renderChangeLink = true): SummaryListRow[] => {
  if (!amendment.changeCoverEndDate) {
    return [];
  }

  const coverEndDate = amendment.coverEndDate ? new Date(amendment.coverEndDate) : null;

  return [
    {
      key: {
        text: 'New cover end date',
        classes: 'amendment-cover-end-date-key',
      },
      value: {
        text: coverEndDate ? format(coverEndDate, DATE_FORMATS.D_MMMM_YYYY) : '-',
        classes: 'amendment-cover-end-date-value',
      },
      actions: {
        items: generateChangeLink({
          href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.COVER_END_DATE })}/?change=true#coverEndDate-day`,
          visuallyHiddenText: 'cover end date',
          datacy: 'change-cover-end-date-link',
          renderChangeLink,
        }),
      },
    },
    ...generateFacilityEndDateSummaryRows(amendment, renderChangeLink),
  ];
};

/**
 * @param amendment - Amendment object
 * @param facility - Facility object
 * @param renderChangeLink - if change link should be rendered - defaults to true
 * @returns the SummaryListRows containing `New facility value`
 */
export const generateFacilityValueSummaryRows = (
  amendment: PortalFacilityAmendmentWithUkefId,
  facility: Facility,
  renderChangeLink = true,
): SummaryListRow[] => {
  if (!amendment.changeFacilityValue) {
    return [];
  }

  const currency = facility.currency?.id.toString();
  const value = getFormattedMonetaryValue(Number(amendment.value));

  return [
    {
      key: {
        text: 'New facility value',
        classes: 'amendment-facility-value-key',
      },
      value: {
        text: `${currency} ${value}`,
        classes: 'amendment-facility-value-value',
      },
      actions: {
        items: generateChangeLink({
          href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/?change=true#facilityValue`,
          visuallyHiddenText: 'facility value',
          datacy: 'change-facility-value-link',
          renderChangeLink,
        }),
      },
    },
  ];
};

/**
 * @param amendment - Amendment object
 * @param facility - Facility object
 * @param renderChangeLink - if change link should be rendered - defaults to true
 * @returns the SummaryListRows for the amendments section
 */
const generateAmendmentSummaryAmendmentRows = (amendment: PortalFacilityAmendmentWithUkefId, facility: Facility, renderChangeLink = true): SummaryListRow[] => {
  return [
    {
      key: {
        text: 'Changes',
        classes: 'amendment-options-key',
      },
      value: {
        html: `
<ul class="govuk-list" data-cy="amendment-options-value"
${amendment.changeCoverEndDate ? `<li>Cover end date and <br>${amendment.isUsingFacilityEndDate ? 'Facility end date' : 'Bank review date'}</li>` : ''}
${amendment.changeFacilityValue ? `<li>Facility value</li>` : ''}
</ul>`,
      },
      actions: {
        items: generateChangeLink({
          href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE })}/?change=true#amendmentOptions`,
          visuallyHiddenText: 'whether amending cover end date or facility value',
          datacy: 'change-amendment-options-link',
          renderChangeLink,
        }),
      },
    },
    ...generateCoverEndDateSummaryRows(amendment, facility, renderChangeLink),
    ...generateFacilityValueSummaryRows(amendment, facility, renderChangeLink),
  ];
};

/**
 * @param amendment - the amendment
 * @param renderChangeLink - if change link should be rendered - defaults to true
 * @returns the SummaryListRows for the eligibility criteria section
 */
const generateAmendmentSummaryEligibilityRows = (amendment: PortalFacilityAmendmentWithUkefId, renderChangeLink = true): SummaryListRow[] => {
  return amendment.eligibilityCriteria.criteria.map((criterion) => {
    const formattedListHtml =
      criterion.textList &&
      `<ol type="i" class="govuk-!-margin-bottom-0 govuk-!-margin-top-1">
${criterion.textList.map((item) => `<li>${item}</li>`).join('')}
</ol>`;

    let formattedAnswer = '-';

    if (criterion.answer === true) {
      formattedAnswer = 'True';
    }
    if (criterion.answer === false) {
      formattedAnswer = 'False';
    }

    return {
      key: {
        html: `${criterion.id}. ${criterion.text}${formattedListHtml ?? ''}`,
        classes: `amendment-eligibility-${criterion.id}-key`,
      },
      value: {
        text: formattedAnswer,
        classes: `amendment-eligibility-${criterion.id}-value`,
      },
      actions: {
        items: generateChangeLink({
          href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.ELIGIBILITY })}/?change=true#${criterion.id}`,
          visuallyHiddenText: `response to eligibility criterion ${criterion.id}`,
          datacy: `change-eligibility-criterion-${criterion.id}-link`,
          renderChangeLink,
        }),
      },
    };
  });
};

/**
 * @param amendment - the amendment
 * @param renderChangeLink - if change link should be rendered - defaults to true
 * @returns the SummaryListRows for the Date amendment effective from section
 */
const generateAmendmentSummaryEffectiveDateRows = (amendment: PortalFacilityAmendmentWithUkefId, renderChangeLink = true): SummaryListRow[] => {
  return [
    {
      key: {
        text: 'Date',
        classes: 'amendment-effective-date-key',
      },
      value: {
        text: amendment.effectiveDate ? format(fromUnixTime(amendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY) : '-',
        classes: 'amendment-effective-date-value',
      },
      actions: {
        items: generateChangeLink({
          href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE })}/?change=true#effectiveDate-day`,
          visuallyHiddenText: 'date amendment effective from',
          datacy: 'change-effective-date-link',
          renderChangeLink,
        }),
      },
    },
  ];
};

/**
 * @param amendment - Amendment object
 * @param facility - Facility object
 * @param renderChangeLink - if change link should be rendered - defaults to true
 * @returns the amendment summary list component parameters
 *
 * The returned arrays are passed into a GOV.UK summary list component in order to render the amendment details.
 * This object does contain html and it would be preferable to create this in a nunjucks file, but the complicated object
 * to array mapping lends itself to typescript
 */
export const mapAmendmentToAmendmentSummaryListParams = (amendment: PortalFacilityAmendmentWithUkefId, facility: Facility, renderChangeLink = true) => ({
  amendmentRows: generateAmendmentSummaryAmendmentRows(amendment, facility, renderChangeLink),
  eligibilityRows: generateAmendmentSummaryEligibilityRows(amendment, renderChangeLink),
  effectiveDateRows: generateAmendmentSummaryEffectiveDateRows(amendment, renderChangeLink),
});
