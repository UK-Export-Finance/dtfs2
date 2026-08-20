import { AxiosStatic } from 'axios';

/**
 * Checks if a given key represents a password field in lowercase
 * @param key The key to check.
 * @returns true if the key is a password field, false otherwise.
 */
export const isPasswordField = (key: string): boolean => key.toLowerCase().includes('password');

/**
 * removes password fields if they exist in the error
 * if they exist, then they are removed
 * if not, then the original data is returned
 * @param data The JSON string to process.
 * @returns The JSON string with password fields removed, or the original string if parsing fails.
 */
export const removePassword = (data: string): string => {
  try {
    const parsed = JSON.parse(data) as Record<string, unknown>;

    /**
     * maps through keys of parsed object
     * checks if key is a password field using isPasswordField function
     * if it is a password field, delete that key from the parsed object
     * return the stringified version of the parsed object without password fields
     */
    for (const key of Object.keys(parsed)) {
      if (isPasswordField(key)) {
        delete parsed[key];
      }
    }

    return JSON.stringify(parsed);
  } catch {
    return data;
  }
};

/**
 * removes password fields from the request body in the error config before the error is passed to the controller
 * this is done to prevent passwords from being logged or exposed in error responses
 * uses axiosInstance.interceptors.response.use as this is the only way to intercept errors in axios
 * @param axiosInstance The Axios instance to register the interceptor on.
 * @returns the error with the request body in the error config having password fields removed
 */
export const removePasswordFromError = (axiosInstance: AxiosStatic): number =>
  axiosInstance.interceptors.response.use(undefined, (error: { config?: { data?: string } }) => {
    const { config } = error ?? {};

    /**
     * if config.data exists (where the request body is stored in the error)
     * then remove any password fields from that request body before error is passed to controller
     */
    if (config?.data) {
      config.data = removePassword(config.data);
    }

    return Promise.reject(error);
  });
