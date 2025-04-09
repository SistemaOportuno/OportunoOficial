const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const db = require('./database');
const { database } = require('./keys');

// Iniciar variable
const app = express();
require('./lib/passport');

// Configuraciones
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(session({
    secret: 'sesion',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Variables globales
app.use(async (req, res, next) => {
    try {
        app.locals.success = req.flash('success');
        app.locals.fail = req.flash('fail');
        app.locals.usuario = req.user;

        const rows = await db.query("SELECT * FROM empresa");
        app.locals.empresa = rows[0] || {};

        const telefonos = await db.query("SELECT * FROM telefonos WHERE tel_estado='ACTIVO'");
        app.locals.telefonos = telefonos || [];

        const correos = await db.query("SELECT * FROM correos WHERE corr_estado='ACTIVO'");
        app.locals.correos = correos || [];

        const direcciones = await db.query("SELECT * FROM direcciones WHERE dir_estado='ACTIVO'");
        app.locals.direcciones = direcciones || [];

        next();
    } catch (error) {
        console.error('Error en las consultas de variables globales:', error.message);
        // Establecer valores por defecto para evitar que la aplicación crashee
        app.locals.empresa = {};
        app.locals.telefonos = [];
        app.locals.correos = [];
        app.locals.direcciones = [];
        next();
    }
});

// Rutas
app.use(require('./routes/'));
app.use(require('./routes/autentication'));
app.use(require('./routes/admin_links'));
app.use(require('./routes/public_links'));
app.use(require('./routes/user_links'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar Server
app.listen(app.get('port'), () => {
    console.log('Servidor iniciado en el puerto ', app.get('port'));
});