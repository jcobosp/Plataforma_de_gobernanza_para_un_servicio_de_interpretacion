'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('userTeams', [
      {
          userId: 1, // ID del usuario
          teamId: 7, // ID del equipo
          tokens: 100, // Tokens del usuario en este equipo
          wallet: 50, // Wallet del usuario en este equipo
          reputation: 0, // Reputación del usuario en este equipo
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

