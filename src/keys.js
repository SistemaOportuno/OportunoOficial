require('dotenv').config();

module.exports = {
    database: {
        host: process.env.DB_HOST || 'switchback.proxy.rlwy.net',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'tXsMIBdFBZnVZQWdHCFjkhizsBMnoqsQ',
        database: process.env.DB_NAME || 'railway'
    }
};