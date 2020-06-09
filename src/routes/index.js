const express=require('express');
const router=express.Router();
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');

router.get('/',(req,res)=>{
    res.render('layouts/inicio');
});

router.get('/lista',(req,res)=>{
    res.render('links/lista');
});

router.get('/anuncio',(req,res)=>{
    res.render('links/anuncio');
});



module.exports=router;