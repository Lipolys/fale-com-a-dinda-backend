const {Sequelize} = require ("sequelize");

const sequelize = new Sequelize('mydb', process.env.USER, process.env.PASSWORD, {
    host: 'localhost', // Ou o endereço do seu servidor de banco
    dialect: 'mysql'
});

module.exports = sequelize;