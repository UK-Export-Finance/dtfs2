import { ACTIVITY_TYPES, TfmActivity } from '@ukef/dtfs2-common';
import { format, getUnixTime, set } from 'date-fns';
import { mapActivities } from './map-activities';

const now = new Date();
const nowZeroMilliseconds = set(now, { milliseconds: 0 });

const cancellation = {
  type: ACTIVITY_TYPES.CANCELLATION,
  timestamp: getUnixTime(now),
  author: {
    _id: 'an id',
    firstName: 'Ronald',
    lastName: 'Stevenson',
  },
  bankRequestDate: now.valueOf(),
  effectiveFrom: now.valueOf(),
  reason: 'This deal needed to be cancelled',
};

const activity = {
  type: ACTIVITY_TYPES.ACTIVITY,
  timestamp: getUnixTime(now),
  author: {
    _id: 'an id',
    firstName: 'Annabelle',
    lastName: 'Johnson-Thompson',
  },
  text: '',
  label: 'Automatic inclusion notice submitted',
};

const comment = {
  type: ACTIVITY_TYPES.COMMENT,
  timestamp: getUnixTime(now),
  author: {
    _id: 'an id',
    firstName: 'John',
    lastName: 'Hyde',
  },
  text: 'The deal looks great and theres nothing wrong with it',
  label: 'This deal looks good',
};

describe('mapActivities', () => {
  it('maps activities correctly', () => {
    // Arrange
    const activities: TfmActivity[] = [cancellation, activity, comment];

    // Act
    const result = mapActivities(activities);

    // Assert
    expect(result).toEqual([
      {
        label: {
          text: 'Deal cancelled',
        },
        html: `
          <p> Deal stage:
            <strong class="govuk-tag govuk-tag--red">
              Cancelled
            </strong>
            <br/><br/>
            Bank request date: ${format(cancellation.bankRequestDate, 'd MMMM yyyy')}
            <br/><br/>
            Date effective from: ${format(cancellation.effectiveFrom, 'd MMMM yyyy')}
            <br/><br/>
            Comments: ${cancellation.reason || '-'}
          </p>`,
        datetime: {
          timestamp: nowZeroMilliseconds,
          type: 'datetime',
        },
        byline: {
          text: `${cancellation.author.firstName} ${cancellation.author.lastName}`,
        },
      },
      {
        label: {
          text: activity.label,
        },
        text: activity.text,
        datetime: {
          timestamp: nowZeroMilliseconds,
          type: 'datetime',
        },
        byline: {
          text: `${activity.author.firstName} ${activity.author.lastName}`,
        },
      },
      {
        label: {
          text: comment.label,
        },
        text: comment.text,
        datetime: {
          timestamp: nowZeroMilliseconds,
          type: 'datetime',
        },
        byline: {
          text: `${comment.author.firstName} ${comment.author.lastName}`,
        },
      },
    ]);
  });

  it('returns empty array if activities is undefined', () => {
    // Act
    const result = mapActivities(undefined);

    // Assert
    expect(result).toEqual([]);
  });
});
