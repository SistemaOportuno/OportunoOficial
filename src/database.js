const mysql = require('mysql');
const { promisify } = require('util');
const { database } = require('./keys');

const pool = mysql.createPool(database);

function handleDisconnect() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err.message);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error('Se perdió la conexión de la Base de Datos');
            } else if (err.code === 'ER_CON_COUNT_ERROR') {
                console.error('Existen muchas conexiones');
            } else if (err.code === 'ECONNREFUSED') {
                console.error('Conexión rechazada');
            } else if (err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
                console.error('Timeout en la conexión a la base de datos');
            }
            // Intentar reconectar después de 5 segundos
            setTimeout(handleDisconnect, 5000);
            return;
        }
        if (connection) {
            connection.release();
            console.log('Conexión a la Base de Datos');
        }
    });
}

handleDisconnect();

pool.query = promisify(pool.query);

module.exports = pool;