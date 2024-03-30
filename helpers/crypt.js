const crypto = require('crypto');

module.exports.encryptPassword = function(password, salt) {
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
};
