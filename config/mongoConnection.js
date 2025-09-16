import {MongoClient, ServerApiVersion} from 'mongodb';
import {mongoConfig} from './settings.js';

let _connection = undefined;
let _db = undefined;

export const dbConnection = async () => {
  if (!_connection) {
    if (!mongoConfig.serverUrl) {
      throw new Error('MongoDB connection string is undefined. Check your .env file!');
    }
    _connection = await MongoClient.connect(mongoConfig.serverUrl );
    _db = _connection.db(mongoConfig.database);
  }

  return _db;
};
export const closeConnection = async () => {
  if (_connection) {
    await _connection.close();
    _connection = null;
    _db = null;
    console.log('MongoDB connection closed');
  }
};

// export {dbConnection, closeConnection};

