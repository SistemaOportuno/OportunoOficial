const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../database');
const helpers = require('./helpers');

passport.use('local.login', new LocalStrategy({
    usernameField: 'usuario_correo',
    passwordField: 'usuario_contrasena',
    passReqToCallback: true
}, async (req, USUARIO, CONTRASENA, done) => {
    const rows = await db.query('SELECT * FROM usuarios WHERE usu_estado = "ACTIVO" AND usu_correo= ? AND usu_contrasena=?', [USUARIO, helpers.encriptar(CONTRASENA)]);
    if(rows.length > 0){
        const usuario=rows[0];
        return done(null, usuario);
    }else{
        return done(null, false, req.flash('fail', 'Credenciales Incorrectas'));
    }
}));
passport.use('local.addPropietario', new LocalStrategy({
    usernameField: 'propietario_correo',
    passwordField: 'propietario_contrasena_n',
    passReqToCallback: true
}, async (req, username, password, done) => {
    if (req.body.propietario_contrasena === req.body.propietario_contrasena_n) {
        const n = await db.query('SELECT count(USU_CORREO) as "N" FROM usuarios WHERE usu_estado="ACTIVO" AND usu_correo=?', [req.body.propietario_correo]);
        if (n[0].N == 0) {
            const new_usuario={
                USU_TIPO:'PROPIETARIO',
                USU_NOMBRE:req.body.propietario_nombre,
                USU_APELLIDO:req.body.propietario_apellido,
                USU_CORREO:req.body.propietario_correo,
                USU_TELEFONO:req.body.propietario_telefono,
                USU_CONTRASENA:helpers.encriptar(req.body.propietario_contrasena),
                USU_FECHA_REGISTRO:helpers.fecha_actual(),
                USU_ESTADO:'ACTIVO'
            }
            const result = await db.query('INSERT INTO usuarios SET ? ', new_usuario);
            const new_cobertura={
                USU_ID:result.insertId,
                PROV_ID:req.body.propietario_cobertura
            }
            await db.query('INSERT INTO cobertura SET ? ', new_cobertura);
            return done(null, new_usuario);
        } else {
            return done(null, false, req.flash('fail', 'El usuario ya esta registrado en el sistema'));
        }
    } else {
        return done(null, false, req.flash('fail', 'Las contraseñas no coinciden'));
    }

}));

passport.serializeUser((new_usuario, done) => {
    done(null, new_usuario);
});
passport.deserializeUser(async (new_usuario, done) => {
    if (new_usuario.USU_TIPO=='PROPIETARIO') {
        const rows = await db.query('SELECT * FROM usuarios WHERE usu_estado = "ACTIVO" AND usu_correo = ? ', [new_usuario.USU_CORREO]);
        done(null, rows[0]);
    }

});