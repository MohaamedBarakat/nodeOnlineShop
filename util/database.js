const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodeComplete', 'root', 'k0122413603', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;