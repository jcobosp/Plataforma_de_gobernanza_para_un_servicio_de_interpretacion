'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('userTeams', [
      {
          userId: 1, 
          teamId: 7, 
          tokens: 100, 
          wallet: 50, 
          reputation: 0, 
          createdAt: new Date(), 
          updatedAt: new Date()
      },
      {
          userId: 1,
          teamId: 9,
          tokens: 50,
          wallet: 25,
          reputation: 0,
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
          userId: 2,
          teamId: 7,
          tokens: 75,
          wallet: 40,
          reputation: 0,
          createdAt: new Date(),
          updatedAt: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    const userTeams = 'userTeams';
    await queryInterface.bulkDelete(userTeams, null, {});
  }
};

