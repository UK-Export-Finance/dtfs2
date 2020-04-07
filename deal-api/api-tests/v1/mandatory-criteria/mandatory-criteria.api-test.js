const wipeDB = require('../../wipeDB');
const aMandatoryCriteria = require('./mandatory-criteria-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const getToken = require('../../getToken')(app);

describe('/v1/mandatory-criteria', () => {
  const newMandatoryCriteria = aMandatoryCriteria({ id: '2' });
  const updatedMandatoryCriteria = aMandatoryCriteria({
    id: '2',
    title: 'Updated mandatory criteria',
  });

  let aTokenWithNoRoles;
  let aTokenWithEditorRole;

  beforeEach(async () => {
    await wipeDB();

    aTokenWithNoRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });
    aTokenWithEditorRole = await getToken({
      username: '3',
      password: '4',
      roles: ['editor'],
    });
  });

  describe('GET /v1/mandatory-criteria', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/mandatory-criteria');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await get('/v1/mandatory-criteria', aTokenWithNoRoles);

      expect(status).toEqual(200);
    });

    it('returns a list of mandatory-criteria sorted by id', async () => {
      const criteria = [
        aMandatoryCriteria({ id: '4' }),
        aMandatoryCriteria({ id: '1' }),
        aMandatoryCriteria({ id: '2' }),
      ];

      await post(criteria[0], aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );
      await post(criteria[1], aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );
      await post(criteria[2], aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );

      const { status, body } = await get(
        '/v1/mandatory-criteria',
        aTokenWithNoRoles,
      );

      const expectedSortedMandatoryCriteria = [
        criteria[1],
        criteria[2],
        criteria[0],
      ];

      expect(status).toEqual(200);
      expect(body.mandatoryCriteria).toEqual(expectMongoIds(expectedSortedMandatoryCriteria));
    });
  });

  describe('GET /v1/mandatory-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/mandatory-criteria/2');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await get(
        '/v1/mandatory-criteria/2',
        aTokenWithNoRoles,
      );

      expect(status).toEqual(200);
    });

    it('returns a mandatory-criteria', async () => {
      await post(newMandatoryCriteria, aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );

      const { status, body } = await get(
        '/v1/mandatory-criteria/2',
        aTokenWithNoRoles,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newMandatoryCriteria));
    });
  });

  describe('POST /v1/mandatory-criteria', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await post(newMandatoryCriteria).to(
        '/v1/mandatory-criteria',
      );

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await post(newMandatoryCriteria, aTokenWithNoRoles).to(
        '/v1/mandatory-criteria',
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await post(
        newMandatoryCriteria,
        aTokenWithEditorRole,
      ).to('/v1/mandatory-criteria');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/mandatory-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await put(updatedMandatoryCriteria).to(
        '/v1/mandatory-criteria/2',
      );

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newMandatoryCriteria, aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );
      const { status } = await put(
        updatedMandatoryCriteria,
        aTokenWithNoRoles,
      ).to('/v1/mandatory-criteria/2');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newMandatoryCriteria, aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );
      const { status } = await put(
        updatedMandatoryCriteria,
        aTokenWithEditorRole,
      ).to('/v1/mandatory-criteria/2');

      expect(status).toEqual(200);
    });

    it('updates the mandatory-criteria', async () => {
      await post(newMandatoryCriteria, aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );
      await put(updatedMandatoryCriteria, aTokenWithEditorRole).to(
        '/v1/mandatory-criteria/2',
      );

      const { status, body } = await get(
        '/v1/mandatory-criteria/2',
        aTokenWithEditorRole,
      );

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(updatedMandatoryCriteria));
    });
  });

  describe('DELETE /v1/mandatory-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await remove('/v1/mandatory-criteria/2');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await post(newMandatoryCriteria, aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );
      const { status } = await remove(
        '/v1/mandatory-criteria/2',
        aTokenWithNoRoles,
      );

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await post(newMandatoryCriteria, aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );
      const { status } = await remove(
        '/v1/mandatory-criteria/2',
        aTokenWithEditorRole,
      );

      expect(status).toEqual(200);
    });

    it('deletes the mandatory-criteria', async () => {
      await post(newMandatoryCriteria, aTokenWithEditorRole).to(
        '/v1/mandatory-criteria',
      );
      await remove('/v1/mandatory-criteria/2', aTokenWithEditorRole);

      const { status, body } = await get(
        '/v1/mandatory-criteria/2',
        aTokenWithEditorRole,
      );

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
