
'use strict';
var crypt = require('../helpers/crypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        username: 'Administrador',
        password: crypt.encryptPassword('1234', '857554756312'),
        salt: '857554756312',
        email: 'administrador@gmail.com',
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        reputation: 0,
        tokens: 0,
        isAdminToken: true,
        isAdminTeam: true,
        isAdminProposal: true,
        lastDailyRewardClaimedAt: null
      },
      {
        username: 'ana_rodriguez',
        password: crypt.encryptPassword('1234', '192837465028'),
        salt: '192837465028',
        email: 'anarodriguez@gmail.com',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        reputation: 0,
        tokens: 0,
        isAdminToken: true,
        isAdminTeam: false,
        isAdminProposal: false,
        lastDailyRewardClaimedAt: null
      },
      {
        username: 'carlos_martinez',
        password: crypt.encryptPassword('1234', '374829182746'),
        salt: '374829182746',
        email: 'carlosmartinez90@gmail.com',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        reputation: 0,
        tokens: 0,
        isAdminToken: false,
        isAdminTeam: true,
        isAdminProposal: false,
        lastDailyRewardClaimedAt: null
      },
      {
        username: 'lauragomez',
        password: crypt.encryptPassword('1234', '564738291020'),
        salt: '564738291020',
        email: 'laura.gomez@gmail.com',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        reputation: 0,
        tokens: 0,
        isAdminToken: false,
        isAdminTeam: false,
        isAdminProposal: true,
        lastDailyRewardClaimedAt: null
      },
      {
        username: 'davidfernandez',
        password: crypt.encryptPassword('1234', '182736454738'),
        salt: '182736454738',
        email: 'davidfer@gmail.com',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        reputation: 0,
        tokens: 0,
        isAdminToken: false,
        isAdminTeam: false,
        isAdminProposal: false,
        lastDailyRewardClaimedAt: null
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
