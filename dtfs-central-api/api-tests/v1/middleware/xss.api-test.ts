import { Response } from '@ukef/dtfs2-common/test-helpers';
import { HttpStatusCode } from 'axios';
import { testApi } from '../../test-api';
import { MOCK_BANKS } from '../../mocks/banks';
import { withoutMongoId } from '../../../server/helpers/mongodb';

describe('xss', () => {
  it('should cleanse any XSS attack in a body payload for a GEF route', async () => {
    // Arrange
    const url = '/v1/portal/gef/deals';
    const deal = {
      dealType: 'GEF <script>alert();</script>',
      status: 'Completed <img data:text/html;base64,PHNj />',
    };

    // Act
    const postResponse: Response = await testApi.post(deal).to(url);
    const getResponse = await testApi.get(`${url}/${postResponse.body._id}`);

    // Assert
    expect(postResponse.status).toBe(HttpStatusCode.Ok);
    expect(getResponse.status).toBe(HttpStatusCode.Ok);

    expect(getResponse.body).toEqual({
      _id: postResponse.body._id,
      dealType: 'GEF ',
      status: 'Completed ',
    });
  });

  it('should cleanse any XSS attack in a body payload for a bank route', async () => {
    // Arrange
    const url = '/v1/bank';
    const bank = {
      ...withoutMongoId(MOCK_BANKS.bank2),
      name: 'Bank <h1>2</h1>',
      partyUrn: '0030<svg onload=alert(1)>svg</svg>0342',
    };

    // Act
    const postResponse: Response = await testApi.post(bank).to(url);
    const getResponse = await testApi.get(`${url}/${bank.id}`);

    // Assert
    expect(postResponse.status).toBe(HttpStatusCode.Ok);
    expect(getResponse.status).toBe(HttpStatusCode.Ok);

    expect(getResponse.body).toEqual({
      ...getResponse.body,
      name: 'Bank 2',
      partyUrn: '00300342',
    });
  });
});
