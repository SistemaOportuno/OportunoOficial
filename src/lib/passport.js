const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../database');
const helpers = require('./helpers');

passport.use('local.login', new LocalStrategy({
    usernameField: 'usuario_correo',
    passwordField: 'usuario_contrasena',
    passReqToCallback: true
}, async (req, USUARIO, CONTRASENA, done) => {
    const rows = await db.query('SELECT * FROM usuarios WHERE usu_correo= ? AND usu_contrasena=?', [USUARIO, helpers.encriptar(CONTRASENA)]);
    if (rows.length > 0) {
        
        const usuario = rows[0];
        if(usuario.USU_ESTADO=="ACTIVO"){
            return done(null, usuario);
        }else if(usuario.USU_ESTADO=="BLOQUEADO"){
            return done(null, false, req.flash('fail', 'Usuario Bloqueado'));
        }else{
            return done(null, false, req.flash('fail', 'Usuario Eliminado'));
        }
        
    } else {
        return done(null, false, req.flash('fail', 'Credenciales Incorrectas'));
    }
}));

passport.use('local.adminLogin', new LocalStrategy({
    usernameField: 'admin_usuario',
    passwordField: 'admin_contrasena',
    passReqToCallback: true
}, async (req, USUARIO, CONTRASENA, done) => {
    const rows = await db.query('SELECT * FROM administrador WHERE  admin_usuario= ? AND admin_contrasena=? AND adm_tipo IN ("PRINCIPAL","SECUNDARIO")', [USUARIO, helpers.encriptar(CONTRASENA)]);
    if (rows.length > 0) {
        const usuario = rows[0];
        return done(null, usuario);
    } else {
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
            const new_usuario = {
                USU_TIPO: 'PROPIETARIO',
                USU_NOMBRE: req.body.propietario_nombre,
                USU_APELLIDO: req.body.propietario_apellido,
                USU_CORREO: req.body.propietario_correo,
                USU_TELEFONO: req.body.propietario_telefono,
                USU_CONTRASENA: helpers.encriptar(req.body.propietario_contrasena),
                USU_FECHA_REGISTRO: helpers.fecha_actual(),
                USU_ESTADO: 'ACTIVO'
            }
            const result = await db.query('INSERT INTO usuarios SET ? ', new_usuario);
            const new_cobertura = {
                USU_ID: result.insertId,
                PROV_ID: req.body.propietario_cobertura
            }
            await db.query('INSERT INTO cobertura SET ? ', new_cobertura);
            return done(null, new_usuario);
        } else {
            return done(null, false, req.flash('fail', 'El Correo ya esta registrado en el sistema'));
        }
    } else {
        return done(null, false, req.flash('fail', 'Las contraseñas no coinciden'));
    }
}));

passport.use('local.addAgente', new LocalStrategy({
    usernameField: 'agente_correo',
    passwordField: 'agente_contrasena_n',
    passReqToCallback: true
}, async (req, username, password, done) => {
    if (req.body.agente_contrasena === req.body.agente_contrasena_n) {
        const n = await db.query('SELECT count(USU_CORREO) as "N" FROM usuarios WHERE usu_estado="ACTIVO" AND usu_correo=?', [req.body.agente_correo]);
        if (n[0].N == 0) {
            const new_agente = {
                USU_TIPO: 'AGENTE',
                USU_NOMBRE: req.body.agente_nombre,
                USU_APELLIDO: req.body.agente_apellido,
                USU_CORREO: req.body.agente_correo,
                USU_TELEFONO: req.body.agente_telefono,
                USU_CONTRASENA: helpers.encriptar(req.body.agente_contrasena),
                USU_FECHA_REGISTRO: helpers.fecha_actual(),
                USU_ESTADO: 'ACTIVO'
            }
            const result = await db.query('INSERT INTO usuarios SET ? ', new_agente);
            if (Array.isArray(req.body.agente_cobertura)) {
                req.body.agente_cobertura.forEach(async (element) => {
                    const new_cobertura = {
                        USU_ID: result.insertId,
                        PROV_ID: element
                    }
                    await db.query('INSERT INTO cobertura SET ? ', new_cobertura);
                });
            } else {
                const new_cobertura = {
                    USU_ID: result.insertId,
                    PROV_ID: req.body.agente_cobertura
                }
                await db.query('INSERT INTO cobertura SET ? ', new_cobertura);
            }
            return done(null, new_agente);
        } else {
            return done(null, false, req.flash('fail', 'El Correo ya esta registrado en el sistema'));
        }
    } else {
        return done(null, false, req.flash('fail', 'Las contraseñas no coinciden'));
    }
}));

passport.use('local.addInmo', new LocalStrategy({
    usernameField: 'inmo_correo',
    passwordField: 'inmo_contrasena_n',
    passReqToCallback: true
}, async (req, username, password, done) => {
    console.log(req.file);
    if (req.body.inmo_contrasena === req.body.inmo_contrasena_n) {
        const n = await db.query('SELECT count(USU_CORREO) as "N" FROM usuarios WHERE usu_estado="ACTIVO" AND usu_correo=?', [req.body.inmo_correo]);
        if (n[0].N == 0) {
            const new_inmo = {
                USU_TIPO: 'INMOBILIARIA',
                USU_NOMBRE: req.body.inmo_nombre,
                USU_APELLIDO: req.body.inmo_apellido,
                USU_CORREO: req.body.inmo_correo,
                USU_TELEFONO: req.body.inmo_telefono,
                USU_CONTRASENA: helpers.encriptar(req.body.inmo_contrasena),
                USU_FECHA_REGISTRO: helpers.fecha_actual(),
                USU_ESTADO: 'ACTIVO',
                USU_EMPRESA:req.body.inmo_empresa,
                USU_EMPRESA_CORREO:req.body.inmo_correo_empresa,
                USU_EMPRESA_TELEFONO:req.body.inmo_telefono_empresa,
                USU_EMPRESA_LOGO:req.file.filename,

            }
            const result = await db.query('INSERT INTO usuarios SET ? ', new_inmo);
            if (Array.isArray(req.body.inmo_cobertura)) {
                req.body.inmo_cobertura.forEach(async (element) => {
                    const new_cobertura = {
                        USU_ID: result.insertId,
                        PROV_ID: element
                    }
                    await db.query('INSERT INTO cobertura SET ? ', new_cobertura);
                });
            } else {
                const new_cobertura = {
                    USU_ID: result.insertId,
                    PROV_ID: req.body.inmo_cobertura
                }
                await db.query('INSERT INTO cobertura SET ? ', new_cobertura);
            }
            return done(null, new_inmo);
        } else {
            return done(null, false, req.flash('fail', 'El Correo ya esta registrado en el sistema'));
        }
    } else {
        return done(null, false, req.flash('fail', 'Las contraseñas no coinciden'));
    }
}));

passport.serializeUser((new_usuario, done) => {
    done(null, new_usuario);
});

passport.deserializeUser(async (new_usuario, done) => {
    if (new_usuario.USU_TIPO) {
        const rows = await db.query('SELECT * FROM usuarios WHERE usu_estado = "ACTIVO" AND usu_correo = ? ', [new_usuario.USU_CORREO]);
        done(null, rows[0]);
    }
    else{
        const rows = await db.query('SELECT * FROM administrador WHERE  admin_id = ? ', [new_usuario.ADMIN_ID]);
        done(null, rows[0]);
    }

});