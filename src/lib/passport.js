const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../database');
const helpers = require('./helpers');

passport.use('local.login', new LocalStrategy({
    usernameField: 'USUARIO',
    passwordField: 'CONTRASENA',
    passReqToCallback: true
}, async (req, USUARIO, CONTRASENA, done) => {
    const rows = await db.query('SELECT * FROM administradores WHERE ADM_USUARIO = ?', [USUARIO]);
    if (rows.length > 0) {
        const usuario = rows[0];
        const validPassword = await helpers.comparar(CONTRASENA, usuario.ADM_CONTRASENA)
        if (validPassword) {
            return done(null, usuario, req.flash('success', 'Bienvenido ' + usuario.ADM_USUARIO));
        } else {
            return done(null, false, req.flash('fail', 'Contraseña Incorecta'));
        }
    } else {
        const rows = await db.query('SELECT * FROM tutores WHERE TUT_USUARIO = ? AND TUT_ESTADO="ACTIVO"', [USUARIO]);
        if (rows.length > 0) {
            const usuario = rows[0];
            const validPassword = await helpers.comparar(CONTRASENA, usuario.TUT_CONTRASENA)
            if (validPassword) {
                return done(null, usuario, req.flash('success', 'Bienvenido ' + usuario.TUT_USUARIO));
            } else {
                return done(null, false, req.flash('fail', 'Contraseña Incorecta'));
            }
        } else {
            return done(null, false, req.flash('fail', 'Usuario no existe'));
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser(async (user, done) => {
    if (user.ADM_ID) {
        const rows = await db.query('SELECT * FROM administradores WHERE ADM_ID = ? ', [user.ADM_ID]);
        done(null, rows[0]);
    } else {
        const rows = await db.query('SELECT * FROM tutores WHERE TUT_ID = ? AND TUT_ESTADO="ACTIVO"', [user.TUT_ID]);
        done(null, rows[0]);
    }

});