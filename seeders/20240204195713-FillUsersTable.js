'use strict';
var crypt = require('../helpers/crypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    return queryInterface.bulkInsert('users', [
      {
          username: 'user33',
          password: crypt.encryptPassword('1234', 'aaaa'),
          salt: 'aaaa',
          email: "user33@gmail.example", 
          isAdmin: false,
          createdAt: new Date(), updatedAt: new Date(),
          reputation: 0,
          tokens: 0,
          isAdminToken: false,
          isAdminTeam: false,
          isAdminProposal: false
      }
      
      
  ]);
  },
  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
