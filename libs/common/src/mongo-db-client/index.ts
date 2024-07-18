import { Collection, Db as DbConnection, MongoClient, OptionalId } from 'mongodb';
import { MongoDbCollectionName } from '../types/mongo-db-models/mongo-db-collection-name';
import { DbModel } from '../types/mongo-db-models/db-model';

type ConnectionOptions = {
  dbConnectionString: string;
  dbName: string;
};

type MongoDbClientConnection =
  | {
      isInitialised: false;
    }
  | {
      isInitialised: true;
      client: MongoClient;
      connection: DbConnection;
    };

export class MongoDbClient {
  private dbName: string;

  private dbConnectionString: string;

  private mongoDbClientConnection: MongoDbClientConnection = {
    isInitialised: false,
  };

  constructor({ dbName, dbConnectionString }: ConnectionOptions) {
    this.dbName = dbName;
    this.dbConnectionString = dbConnectionString;
  }

  /**
   * Gets the initialised client. If the client is not yet
   * initialised, initialises the client and then returns it
   * @returns The initialised client
   */
  private async getOrInitialiseClient(): Promise<MongoDbClientConnection & { isInitialised: true }> {
    if (this.mongoDbClientConnection.isInitialised) {
      return this.mongoDbClientConnection;
    }
    const client = await MongoClient.connect(this.dbConnectionString);
    const connection = client.db(this.dbName);
    this.mongoDbClientConnection = {
      isInitialised: true,
      client,
      connection,
    };
    return this.mongoDbClientConnection;
  }

  /**
   * Gets the initialised connection
   * @returns The initialised connection
   */
  public async getConnection(): Promise<DbConnection> {
    return (await this.getOrInitialiseClient()).connection;
  }

  /**
   * Gets a specific collection
   * @param collectionName - The collection name to get
   * @returns The collection
   */
  public async getCollection<CollectionName extends MongoDbCollectionName>(
    collectionName: CollectionName,
  ): Promise<Collection<OptionalId<DbModel<CollectionName>>>> {
    return (await this.getOrInitialiseClient()).connection.collection(collectionName);
  }

  /**
   * Gets the initialised client
   * @returns The initialised client
   */
  public async getClient(): Promise<MongoClient> {
    return (await this.getOrInitialiseClient()).client;
  }

  /**
   * Closes the connection or, if the connection
   * is not initialised, does nothing
   */
  public async close(): Promise<void> {
    if (!this.mongoDbClientConnection.isInitialised) {
      return;
    }
    await this.mongoDbClientConnection.client.close();
    this.mongoDbClientConnection = {
      isInitialised: false,
    };
  }
}
