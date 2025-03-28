const express=require('express');
const morgan=require('morgan');
const exphbs=require('express-handlebars');
const path=require('path');
const flash =require('connect-flash');
const session=require('express-session');
const mysqlStore=require('express-mysql-session');
const passport=require('passport');
const db = require('./database');
const {database}=require('./keys');
//Iniciar variable
const app=express();
require('./lib/passport');

//Configuraciones
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname,'views'));
app.engine('.hbs',exphbs({
    defaultLayout:'main',
    layoutDir:path.join(app.get('views'),'layouts'),
    partialsDir:path.join(app.get('views'),'partials'),
    extname:'.hbs',
    helpers:require('./lib/handlebars')
}));
app.set('view engine', '.hbs'); 

//Midelwares
app.use(session({
    secret:'sesion',
    resave:false,
    saveUninitialized:false,
    store:new mysqlStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extendend:false})); 
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Variables globales
app.use(async(req,res,next)=>{
    app.locals.success=req.flash('success');
    app.locals.fail=req.flash('fail');
    app.locals.usuario=req.user;
    const rows=await db.query("select * from empresa");
    app.locals.empresa=rows[0];
    app.locals.telefonos=await db.query("select * from telefonos where tel_estado='ACTIVO'");
    app.locals.correos=await db.query("select * from correos where corr_estado='ACTIVO'");
    app.locals.direcciones=await db.query("select * from direcciones where dir_estado='ACTIVO'");
    next();
});

//Rutas
app.use(require('./routes/'));
app.use(require('./routes/autentication'));
app.use(require('./routes/admin_links'));
app.use(require('./routes/public_links'));
app.use(require('./routes/user_links'));


//Public
app.use(express.static(path.join(__dirname,'public')));


//Iniciar Server
app.listen(app.get('port'),()=>{
    console.log('Servidor iniciado en el puerto ', app.get('port'));
});
