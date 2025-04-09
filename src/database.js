const mysql = require('mysql');
const { promisify } = require('util');
const { database } = require('./keys');

const pool = mysql.createPool({
    ...database,
    connectTimeout: 60000, // 60 segundos
    acquireTimeout: 60000, // 60 segundos para adquirir una conexión del pool
    connectionLimit: 10, // Límite de conexiones en el pool
    waitForConnections: true, // Esperar si no hay conexiones disponibles
    queueLimit: 0 // Sin límite en la cola de conexiones
});

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
            } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                console.error('Acceso denegado: revisa las credenciales');
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