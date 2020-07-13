const express=require('express');
const router=express.Router();

const passport= require('passport');
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');

router.get('/addPropietario', async (req, res) => {
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    res.render('public/addPropietario', { provincias });
});
router.post('/addPropietario', passport.authenticate('local.addPropietario', {
    successRedirect: 'panel',
    failureRedirect: '/addPropietario',
    failureFlash: true
}));

router.get('/login',isNotLoggedIn, async (req, res) => {
    res.render('auth/login');
});

router.post('/login',(req,res,next)=>{
    passport.authenticate('local.login',{
        successRedirect:'/panel',
        failureRedirect:'/login',
        failureFlash:true
    })(req,res,next);
});





router.get('/logout',isLoggedIn,(req, res)=>{
    req.logOut();
    res.redirect('/');
});




module.exports=router;