jest.mock('../server/routes/api-data-provider', () => ({
    ...(jest.requireActual('../server/routes/api-data-provider')),
    provide: () => (req, res, next) => next(),
}));
jest.mock('../server/routes/middleware/validateBank', () => (req, res, next) => next());

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { NON_ADMIN_ROLES } = require('../server/constants');

const _id = '64ef48ee17a3231be0ad48b3';

describe('contract routes', () => {
    describe('GET /contract/:_id', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}`, {}, headers),
            allowedNonAdminRoles: NON_ADMIN_ROLES,
            successCode: 200,
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/comments', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/comments`, {}, headers),
            allowedNonAdminRoles: NON_ADMIN_ROLES,
            successCode: 200,
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/submission-details', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/submission-details`, {}, headers),
            allowedNonAdminRoles: NON_ADMIN_ROLES,
            successCode: 200,
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/delete', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/delete`, {}, headers),
            allowedNonAdminRoles: ['maker'],
            successCode: 200,
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('POST /contract/:_id/delete', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/delete`),
            allowedNonAdminRoles: ['maker'],
            successCode: 302,
            successHeaders: { location: '/dashboard' },
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/ready-for-review', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/ready-for-review`, {}, headers),
            allowedNonAdminRoles: ['maker'],
            successCode: 200,
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('POST /contract/:_id/ready-for-review', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/ready-for-review`),
            allowedNonAdminRoles: ['maker'],
            successCode: 302,
            successHeaders: { location: '/dashboard' },
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/edit-name', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/edit-name`, {}, headers),
            allowedNonAdminRoles: ['maker'],
            successCode: 200,
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('POST /contract/:_id/edit-name', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/edit-name`),
            allowedNonAdminRoles: ['maker'],
            successCode: 302,
            successHeaders: { location: `/contract/${_id}` },
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/return-to-maker', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/return-to-maker`, {}, headers),
            allowedNonAdminRoles: ['checker'],
            successCode: 200,
        })
    })

    describe('POST /contract/:_id/return-to-maker', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/return-to-maker`),
            allowedNonAdminRoles: ['checker'],
            successCode: 302,
            successHeaders: { location: `/dashboard` },
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/confirm-submission', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/confirm-submission`, {}, headers),
            allowedNonAdminRoles: ['checker'],
            successCode: 200,
        })
    })

    describe('POST /contract/:_id/confirm-submission', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/confirm-submission`),
            allowedNonAdminRoles: ['checker'],
            successCode: 302,
            successHeaders: { location: `/dashboard` },
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/clone', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/clone`, {}, headers),
            allowedNonAdminRoles: ['maker'],
            successCode: 200,
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('POST /contract/:_id/clone', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/clone`),
            allowedNonAdminRoles: ['maker'],
            successCode: 302,
            successHeaders: { location: `/dashboard` },
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('GET /contract/:_id/clone/before-you-start', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => get(`/contract/${_id}/clone/before-you-start`, {}, headers),
            allowedNonAdminRoles: ['maker'],
            successCode: 200,
            disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        })
    })

    describe('POST /contract/:_id/clone/before-you-start', () => {
        withRoleValidationApiTests({
            makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/clone/before-you-start`),
            allowedNonAdminRoles: ['maker'],
            successCode: 302,
            successHeaders: { location: `/unable-to-proceed` },
        })
    })
});
