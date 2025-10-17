// import { ObjectId } from 'mongodb';
// import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
// import { queryAllFacilities } from './facilities.controller';
// import { mongoDbClient } from '../../drivers/db-client';
// import completedDeal from '../../../api-tests/fixtures/deal-fully-completed';
// import api from '../api';

// const { mockFacilities } = completedDeal;

// const mockAcknowledgedAmendmentsByFacilityId = jest.fn();

// let mockDatabase = {};

// describe('facilities.controller', () => {
//   beforeEach(() => {
//     jest.spyOn(api, 'getAcknowledgedAmendmentsByFacilityId').mockImplementation(mockAcknowledgedAmendmentsByFacilityId);
//     mockAcknowledgedAmendmentsByFacilityId.mockResolvedValue([]);
//   });

//   afterEach(() => {
//     jest.resetAllMocks();
//   });

//   describe('queryAllFacilities', () => {
//     afterEach(() => {
//       jest.resetAllMocks();
//     });

//     describe('when no result is returned', () => {
//       beforeEach(() => {
//         const mockToArray = jest.fn().mockResolvedValue([]);
//         const mockAggregate = jest.fn().mockReturnValue({ toArray: mockToArray });

//         mockDatabase = {
//           getCollection: jest.fn().mockResolvedValue({ aggregate: mockAggregate }),
//         };

//         mongoDbClient.getCollection = mockDatabase.getCollection;
//       });

//       it('should return an empty array and count of 0', async () => {
//         const results = await queryAllFacilities({}, {}, 0, 0);

//         expect(results).toEqual({ facilities: [], count: 0 });
//       });

//       it('should not call getAcknowledgedAmendmentsByFacilityId', async () => {
//         await queryAllFacilities({}, {}, 0, 0);

//         expect(api.getAcknowledgedAmendmentsByFacilityId).toHaveBeenCalledTimes(0);
//       });
//     });

//     describe('when results are returned and no amendments are present', () => {
//       beforeEach(() => {
//         const mockToArray = jest.fn().mockResolvedValue([
//           {
//             facilities: mockFacilities,
//             count: mockFacilities.length,
//           },
//         ]);

//         const mockAggregate = jest.fn().mockReturnValue({ toArray: mockToArray });

//         mockDatabase = {
//           getCollection: jest.fn().mockResolvedValue({ aggregate: mockAggregate }),
//         };

//         mongoDbClient.getCollection = mockDatabase.getCollection;
//       });

//       it('should return an array of facilities and a count', async () => {
//         const results = await queryAllFacilities({}, {}, 0, 0);

//         const expected = {
//           facilities: mockFacilities,
//           count: mockFacilities.length,
//         };

//         expect(results).toEqual(expected);
//       });

//       it('should call getAcknowledgedAmendmentsByFacilityId once for each facility', async () => {
//         await queryAllFacilities({}, {}, 0, 0);

//         expect(api.getAcknowledgedAmendmentsByFacilityId).toHaveBeenCalledTimes(mockFacilities.length);
//       });
//     });

//     describe('when results are returned and amendments are present', () => {
//       const amendments = [
//         {
//           _id: new ObjectId(),
//           facilityId: '1',
//           coverEndDate: '2024-12-31T00:00:00.000Z',
//           value: 5000,
//           status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
//         },
//         {
//           _id: new ObjectId(),
//           facilityId: '2',
//           coverEndDate: '2025-06-30T00:00:00.000Z',
//           value: 10000,
//           status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
//         },
//       ];

//       beforeEach(() => {
//         const mockToArray = jest.fn().mockResolvedValue([
//           {
//             facilities: mockFacilities,
//             count: mockFacilities.length,
//           },
//         ]);

//         const mockAggregate = jest.fn().mockReturnValue({ toArray: mockToArray });

//         mockDatabase = {
//           getCollection: jest.fn().mockResolvedValue({ aggregate: mockAggregate }),
//         };

//         mongoDbClient.getCollection = mockDatabase.getCollection;

//         mockAcknowledgedAmendmentsByFacilityId.mockImplementation((facilityId) =>
//           Promise.resolve(amendments.filter((amendment) => amendment.facilityId === facilityId)),
//         );
//       });

//       it('should return an array of facilities with amended values and a count', async () => {
//         const results = await queryAllFacilities({}, {}, 0, 0);

//         const expectedFacilities = mockFacilities.map((facility) => {
//           const amendment = amendments.find((a) => a.facilityId === facility._id);
//           if (amendment) {
//             return {
//               ...facility,
//               coverEndDate: new Date(amendment.coverEndDate),
//               value: amendment.value,
//             };
//           }
//           return facility;
//         });

//         const expected = {
//           facilities: expectedFacilities,
//           count: mockFacilities.length,
//         };

//         expect(results).toEqual(expected);
//       });

//       it('should call getAcknowledgedAmendmentsByFacilityId once for each facility', async () => {
//         await queryAllFacilities({}, {}, 0, 0);

//         expect(api.getAcknowledgedAmendmentsByFacilityId).toHaveBeenCalledTimes(mockFacilities.length);
//       });
//     });
//   });
// });
