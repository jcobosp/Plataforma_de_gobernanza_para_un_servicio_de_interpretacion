'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPostVotes extends Model {}

  UserPostVotes.init(
    {
      userId: {
        type: DataTypes.INTEGER
      },
      postId: {
        type: DataTypes.INTEGER
      },
      hasVoted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lastVote: {
        type: DataTypes.STRING, 
        allowNull: true,
      },
      lastVotePoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      originalVotePoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      sequelize,
      modelName: 'UserPostVotes',
    }
  );

  return UserPostVotes;
};

