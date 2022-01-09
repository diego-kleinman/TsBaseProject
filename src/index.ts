import { ApolloServer } from 'apollo-server';
import typeDefs from './types/index';
import resolvers from './resolvers/index';

import { Sequelize } from 'sequelize';
import sequelizeConnection from './DAL/database_context';
import userModel from './models/user';
import tweetModel from './models/tweet';
import commentModel from './models/comment';

const createAssociations = async () => {
  try {
    await sequelizeConnection.authenticate();
    console.log('Connection established successfully');

    try {
      // Create models
      const user = userModel(sequelizeConnection, Sequelize);
      const tweet = tweetModel(sequelizeConnection, Sequelize);
      const comment = commentModel(sequelizeConnection, Sequelize);

      // Associate them
      user.hasMany(tweet, { onDelete: 'CASCADE' });
      user.hasMany(comment, { onDelete: 'CASCADE' });
      tweet.hasMany(comment, { onDelete: 'CASCADE' });
      tweet.belongsTo(user);
      comment.belongsTo(user);
      comment.belongsTo(tweet);

      console.log('Database models associated');
    } catch (error) {
      console.log('Unexpected error synchronizing database: ', error);
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: process.env.PORT || 3000 }).then(({ url }) => {
  createAssociations().then(() => {
    console.log(`graphQL running at ${url}`);
  });
});