module.exports = {
    isUserLog(req, res, next) {
        if (req.isAuthenticated() && (req.user.USU_TIPO == 'PROPIETARIO' || req.user.USU_TIPO == 'AGENTE' || req.user.USU_TIPO == 'INMOBILIARIA')) {
            return next();
        }
        return res.redirect('/');
    },
    isAdminLog(req, res, next) {
        if (req.isAuthenticated() && (req.user.ADMIN_ID)) {
            return next();
        }
        return res.redirect('/');
    },
    isAdminPrincipalLog(req, res, next) {
        if (req.isAuthenticated() && (req.user.ADMIN_ID) && (req.user.ADM_TIPO=='PRINCIPAL')) {
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
        }else{
            if (req.isAuthenticated() && (req.user.ADMIN_ID)) {
                return res.redirect('/adminPanel');
            }else{
                return res.redirect('/panel');
            }
        }
        
    }
};