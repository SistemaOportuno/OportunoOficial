const express=require('express');
const router=express.Router();

const passport= require('passport');
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');



router.get('/login',isNotLoggedIn,(req,res)=>{
    res.render('auth/login');
});
router.post('/login',isNotLoggedIn,(req,res,next)=>{
    passport.authenticate('local.login',{
        successRedirect:'/inicio',
        failureRedirect:'/login',
        failureFlash:true
    })(req,res,next);
});
router.get('/logout',isLoggedIn,(req, res)=>{
    req.logOut();
    res.redirect('/login');
});

router.get('/inicio',isLoggedIn,(req, res)=>{
    res.render('layouts/inicio');
});


module.exports=router;