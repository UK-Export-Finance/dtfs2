import { HttpStatusCode } from 'axios';
import { getOrCreateParty } from './party-db.controller';

console.info = jest.fn();

describe('getOrCreateParty', async () => {
    it(`should return ${HttpStatusCode.BadRequest} when an invalid company registration number is provided`, () => {
        // Arrange
        const companyRegistrationNumber = '';

        // Act
        const response = await getOrCreateParty();

        // Assert
        expect(console.info).toHaveBeenCalledTimes(1);
        expect(console.info).toHaveBeenCalledWith('Invalid company registration number provided %s', companyRegistrationNumber);
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
        expect(mockResponse.send).toHaveBeenCalledWith({ status: HttpStatusCode.BadRequest, data: 'Invalid company registration number' });
    });
});