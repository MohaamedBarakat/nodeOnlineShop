const Seqeulize = require('sequelize');

const seqeulize = require('../util/database');

const User = seqeulize.define('user', {
    id: {
        type: Seqeulize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Seqeulize.STRING,
    email: Seqeulize.STRING
});
module.exports = User;