import { Collection, Db as DbConnection, MongoClient, WithoutId } from 'mongodb';
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

  private async initClient(): Promise<MongoDbClientConnection & { isInitialised: true }> {
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

  public async getConnection(): Promise<DbConnection> {
    return (await this.initClient()).connection;
  }

  public async getCollection<CollectionName extends MongoDbCollectionName>(
    collectionName: CollectionName,
  ): Promise<Collection<WithoutId<DbModel<CollectionName>>>> {
    return (await this.initClient()).connection.collection(collectionName);
  }

  public async getClient(): Promise<MongoClient> {
    return (await this.initClient()).client;
  }

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
