import { format, fromUnixTime } from 'date-fns';
import { DATE_FORMATS, PortalFacilityAmendmentWithUkefId, SummaryListRow } from '@ukef/dtfs2-common';
import { getAmendmentsUrl } from './navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

const generateFacilityEndDateSummaryRows = (amendment: PortalFacilityAmendmentWithUkefId): SummaryListRow[] => {
  if (amendment.isUsingFacilityEndDate) {
    return [
      {
        key: {
          text: 'New facility end date',
        },
        value: {
          text: amendment.facilityEndDate === undefined ? '-' : format(amendment.facilityEndDate, DATE_FORMATS.D_MMMM_YYYY),
        },
        actions: {
          items: [
            {
              href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE })}/#facilityEndDate-day`,
              text: 'Change',
              visuallyHiddenText: 'facility end date',
            },
          ],
        },
      },
    ];
  }

  return [
    {
      key: {
        text: 'New bank review date',
      },
      value: {
        text: amendment.bankReviewDate === undefined ? '-' : format(amendment.bankReviewDate, DATE_FORMATS.D_MMMM_YYYY),
      },
      actions: {
        items: [
          {
            href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE })}/#bankReviewDate-day`,
            text: 'Change',
            visuallyHiddenText: 'bank review date',
          },
        ],
      },
    },
  ];
};

const generateCoverEndDateSummaryRows = (amendment: PortalFacilityAmendmentWithUkefId): SummaryListRow[] => {
  if (!amendment.changeCoverEndDate) {
    return [];
  }

  return [
    {
      key: {
        text: 'New cover end date',
      },
      value: {
        text: amendment.coverEndDate === undefined ? '-' : format(new Date(amendment.coverEndDate), DATE_FORMATS.D_MMMM_YYYY),
      },
      actions: {
        items: [
          {
            href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.COVER_END_DATE })}/#coverEndDate-day`,
            text: 'Change',
            visuallyHiddenText: 'cover end date',
          },
        ],
      },
    },
    ...generateFacilityEndDateSummaryRows(amendment),
  ];
};

const generateFacilityValueSummaryRows = (amendment: PortalFacilityAmendmentWithUkefId): SummaryListRow[] => {
  if (!amendment.changeFacilityValue) {
    return [];
  }

  return [
    {
      key: {
        text: 'New facility value',
      },
      value: {
        text: amendment.value?.toString() ?? '-',
      },
      actions: {
        items: [
          {
            href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.FACILITY_VALUE })}/#facilityValue`,
            text: 'Change',
            visuallyHiddenText: 'facility value',
          },
        ],
      },
    },
  ];
};

const generateAmendmentSummaryAmendmentRows = (amendment: PortalFacilityAmendmentWithUkefId): SummaryListRow[] => {
  return [
    {
      key: {
        text: 'Changes',
      },
      value: {
        html: `
<ul class="govuk-list">
${amendment.changeCoverEndDate ? `<li>Cover end date and Facility end date</li>` : ''}
${amendment.changeFacilityValue ? `<li>Facility value</li>` : ''}
</ul>`,
      },
      actions: {
        items: [
          {
            href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE })}/#amendmentOptions`,
            text: 'Change',
            visuallyHiddenText: 'whether amendending cover end date or facility value',
          },
        ],
      },
    },
    ...generateCoverEndDateSummaryRows(amendment),
    ...generateFacilityValueSummaryRows(amendment),
  ];
};

const generateAmendmentSummaryEligibilityRows = (amendment: PortalFacilityAmendmentWithUkefId): SummaryListRow[] => {
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
      },
      value: {
        text: formattedAnswer,
      },
      actions: {
        items: [
          {
            href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.ELIGIBILITY })}/#${criterion.id}`,
            text: 'Change',
            visuallyHiddenText: `response to eligibility criteria ${criterion.id}`,
          },
        ],
      },
    };
  });
};

const generateAmendmentSummaryEffectiveDateRows = (amendment: PortalFacilityAmendmentWithUkefId): SummaryListRow[] => {
  return [
    {
      key: {
        text: 'Date',
      },
      value: {
        text: amendment.effectiveDate === undefined ? '-' : format(fromUnixTime(amendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY),
      },
      actions: {
        items: [
          {
            href: `${getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE })}/#effectiveDate-day`,
            text: 'Change',
            visuallyHiddenText: 'date amendment effective from',
          },
        ],
      },
    },
  ];
};

export const mapAmendmentToAmendmentSummaryListParams = (amendment: PortalFacilityAmendmentWithUkefId) => ({
  amendmentRows: generateAmendmentSummaryAmendmentRows(amendment),
  eligibilityRows: generateAmendmentSummaryEligibilityRows(amendment),
  effectiveDateRows: generateAmendmentSummaryEffectiveDateRows(amendment),
});
