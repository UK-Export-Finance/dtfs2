import { Db as DbConnection, MongoClient } from 'mongodb';

/**
 * Represents the state of a MongoDB client connection.
 * This is a union type.
 *
 * This type can be either uninitialized or initialized.
 */
export type MongoDbClientConnection =
  | {
      /**
       * Indicates that the MongoDB client connection is not initialized.
       */
      isInitialised: false;
    }
  | {
      /**
       * Indicates that the MongoDB client connection is initialized.
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
