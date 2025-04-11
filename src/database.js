const mysql = require('mysql2');
const { promisify } = require('util');
const { database } = require('./keys');

const pool = mysql.createPool(database);

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Se perdió la conexión de la Base de Datos');
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Existen muchas conexiones');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Conexión rechazada');
        } else {
            console.error('Error al conectar a la Base de Datos:', err.message);
        }
        return;
    }
    if (connection) {
        connection.release();
        console.log('Conexión a la Base de Datos establecida');
        return;
    }
});

// Promisify para usar async/await en las consultas
pool.query = promisify(pool.query);

module.exports = pool;