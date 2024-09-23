import { Collection, Db as DbConnection, MongoClient, WithoutId } from 'mongodb';
import dotenv from 'dotenv';
import { MongoConnectionStatus } from '../types';
import { MongoDbCollectionName } from '../types/mongo-db-models/mongo-db-collection-name';
import { DbModel } from '../types/mongo-db-models/db-model';

dotenv.config();

const { MONGODB_URI, MONGO_INITDB_DATABASE } = process.env;

/**
 * Class representing a MongoDB client.
 */
export class MongoDbClient {
  /**
   * MongoDB connection string.
   */
  private uri: string = MONGODB_URI as string;

  /**
   * MongoDB database name.
   */
  private name: string = MONGO_INITDB_DATABASE as string;

  /**
   * Client connection status.
   */
  private clientConnection: MongoConnectionStatus = {
    isInitialised: false,
  };

  /**
   * Gets the initialised client. If the client is not yet initialised,
   * initialises the client and then returns it.
   *
   * @returns {Promise<MongoConnectionStatus>} The initialised client.
   */
  private async getInitialisedClient(): Promise<MongoConnectionStatus> {
    if (this.clientConnection.isInitialised) {
      return this.clientConnection;
    }

    const client = await MongoClient.connect(this.uri);
    const connection = client.db(this.name);

    this.clientConnection = {
      isInitialised: true,
      client,
      connection,
    };

    return this.clientConnection;
  }

  /**
   * Gets the initialised connection.
   *
   * @returns {Promise<DbConnection>} The initialised connection.
   * @throws {Error} If the client connection is not initialised.
   */
  public async getConnection(): Promise<DbConnection> {
    const client = await this.getInitialisedClient();

    if (!client.isInitialised) {
      throw new Error('Client connection is not initialised');
    }

    const { connection } = client;

    return connection;
  }

  /**
   * Gets a specific collection.
   *
   * @param {CollectionName} collectionName - The collection name to get.
   * @returns {Promise<Collection<WithoutId<DbModel<CollectionName>>>>} The collection.
   * @throws {Error} If the client connection is not initialised.
   */
  public async getCollection<CollectionName extends MongoDbCollectionName>(
    collectionName: CollectionName,
  ): Promise<Collection<WithoutId<DbModel<CollectionName>>>> {
    const client = await this.getInitialisedClient();

    if (!client.isInitialised) {
      throw new Error('Client connection is not initialised');
    }

    return client.connection.collection(collectionName);
  }

  /**
   * Gets the initialised client.
   *
   * @returns {Promise<MongoClient>} The initialised client.
   * @throws {Error} If the client connection is not initialised.
   */
  public async getClient(): Promise<MongoClient> {
    const client = await this.getInitialisedClient();

    if (!client.isInitialised) {
      throw new Error('Client connection is not initialised');
    }

    return client.client;
  }

  /**
   * Closes the connection or, if the connection is not initialised, does nothing.
   *
   * @returns {Promise<void>}
   */
  public async close(): Promise<void> {
    if (!this.clientConnection.isInitialised) {
      return;
    }

    await this.clientConnection.client.close();

    this.clientConnection = {
      isInitialised: false,
    };
  }
}
