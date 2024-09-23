import { Db as DbConnection, MongoClient } from 'mongodb';

/**
 * Represents the status of a MongoDB client connection.
 * This is a union type.
 *
 * This type can be either uninitialised or initialised.
 */
export type MongoConnectionStatus =
  | {
      /**
       * Indicates that the MongoDB client connection is not initialised.
       */
      isInitialised: false;
    }
  | {
      /**
       * Indicates that the MongoDB client connection is initialised.
       */
      isInitialised: true;
      /**
       * The MongoDB client instance.
       */
      client: MongoClient;
      /**
       * The database connection instance.
       */
      connection: DbConnection;
    };
