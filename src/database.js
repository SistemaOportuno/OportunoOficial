const mysql =require('mysql');
const{promisify}=require('util');
const {database}=require('./keys');

const pool= mysql.createPool(database);

pool.getConnection((err,connection)=>{
    if(err){
        if(err.code==='PROTOCOL_CONNECTION_LOST'){
            console.error('Se perdio la conexión de la Base de Datos');
        }if(err.code==='ER_CON_COUNT_ERROR'){
            console.error('Existen muchas conexiones');
        }if(err.code==='ECONNREFUSED'){
            console.error('Conexión rechazada');
        }
        return;
    }
    if(connection){
        connection.release();
        console.log('Conexión a la Base de Datos');
        return;
    }
});

pool.query=promisify(pool.query);

module.exports=pool;
