import { ACTIVITY_TYPES, TfmActivity } from '@ukef/dtfs2-common';
import { fromUnixTime } from 'date-fns';

/**
 * Map activities for use in {@link https://design-patterns.service.justice.gov.uk/components/timeline/ | MOJ timeline}
 * @param activities tfm activities
 * @returns array of timeline items
 */
export const mapActivities = (activities?: TfmActivity[]) => {
  if (!activities) {
    return [];
  }

  return activities.map((activity) => {
    const datetime = {
      timestamp: fromUnixTime(activity.timestamp),
      type: 'datetime',
    };

    const byline = {
      text: `${activity.author.firstName} ${activity.author.lastName}`,
    };

    switch (activity.type) {
      case ACTIVITY_TYPES.CANCELLATION:
        return {
          type: activity.type,
          label: {
            text: 'Deal cancelled',
          },
          bankRequestDate: activity.bankRequestDate,
          effectiveFrom: activity.effectiveFrom,
          reason: activity.reason,
          datetime,
          byline,
        };
      default:
        return {
          type: activity.type,
          label: {
            text: activity.label,
          },
          text: activity.text,
          datetime,
          byline,
        };
    }
  });
};
