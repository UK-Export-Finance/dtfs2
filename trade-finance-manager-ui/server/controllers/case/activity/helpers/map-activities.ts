import { ACTIVITY_TYPES, TfmActivity } from '@ukef/dtfs2-common';
import { format, fromUnixTime } from 'date-fns';

export const mapActivities = (activities: TfmActivity[]) => {
  if (!activities) {
    return false;
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
          label: {
            text: 'Deal cancelled',
          },
          html: `
          <p> Deal stage:
            <strong class="govuk-tag govuk-tag--red">
              Cancelled
            </strong>
            <br/><br/>
            Bank request date: ${format(activity.bankRequestDate, 'd MMMM yyyy')}
            <br/><br/>
            Date effective from: ${format(activity.effectiveFrom, 'd MMMM yyyy')}
            <br/><br/>
            Comments: ${activity.reason || '-'}
          </p>`,
          datetime,
          byline,
        };
      default:
        return {
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
