/*
 * Scenario this helper exists for:
 *
 * On a fresh MongoDB the loader was crashing with `MongoServerError: ns not
 * found` (code 26, `NamespaceNotFound`) during the Portal bank list seed
 * step, because `db.getCollection(...)` only returns a handle and
 * `deleteMany({})` is a no-op against a missing collection — so by the time
 * we called `dropIndexes()` there was no namespace yet and the driver
 * rejected. Locally the bug was invisible because existing dev databases
 * already had the collection from earlier runs, but every CI run starts
 * clean and hit the error. This helper wraps `dropIndexes()` and swallows
 * only error code 26 while rethrowing everything else, so a fresh database
 * silently skips the no-op drop and the subsequent `createIndex` calls
 * implicitly create both the namespace and the indexes, while existing
 * databases still get their stale indexes dropped and re-created without an
 * `IndexOptionsConflict` and any genuine driver, auth, or permission
 * failure still aborts the loader loudly.
 */

import { Collection } from 'mongodb';

const NAMESPACE_NOT_FOUND_CODE = 26;

/**
 * Drops every non-`_id_` index on the given collection, ignoring the
 * `NamespaceNotFound` (code 26) error MongoDB raises when the underlying
 * namespace has not been created yet. Any other failure propagates.
 *
 * Use this when re-running a seed/migration script against environments
 * that may or may not already have the collection present.
 */
export const dropIndexesIfNamespaceExists = async (collection: Pick<Collection, 'dropIndexes'>): Promise<void> => {
  try {
    await collection.dropIndexes();
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'number' ? error.code : undefined;

    if (code !== NAMESPACE_NOT_FOUND_CODE) {
      throw error;
    }
  }
};
