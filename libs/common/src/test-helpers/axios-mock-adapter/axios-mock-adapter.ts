import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

type MockAdapterAxios = ConstructorParameters<typeof MockAdapter>[0];

/**
 * This is a mock adapter for axios that can be used in tests.
 */
export const axiosMock = new MockAdapter(axios as unknown as MockAdapterAxios);
