module.exports = {
    isUserLog(req, res, next) {
        if (req.isAuthenticated() && (req.user.USU_TIPO == 'PROPIETARIO' || req.user.USU_TIPO == 'AGENTE' || req.user.USU_TIPO == 'INMOBILIARIA')) {
            return next();
        }
        return res.redirect('/');
    },
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/');
    },
    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/panel');
    }
};