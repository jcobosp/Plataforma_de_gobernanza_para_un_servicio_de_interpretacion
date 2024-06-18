
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserTeam extends Model {
    static associate(models) {
      
    }
  }
  UserTeam.init({
    userId: {
       type: DataTypes.INTEGER
    },
    teamId: {
        type: DataTypes.INTEGER
     },
    tokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0 
     },
    wallet: {
        type: DataTypes.INTEGER,
        defaultValue: 0 
     },
    reputation: {
        type: DataTypes.INTEGER,
        defaultValue: 0 
     }
  }, {
    sequelize,
    modelName: 'UserTeam',
  });
  return UserTeam;
};
