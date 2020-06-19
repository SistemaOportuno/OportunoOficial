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

router.get('/addPropietario',(req,res)=>{
    res.render('auth/addPropietario');
});
router.get('/addAgente',(req,res)=>{
    res.render('auth/addAgente');
});
router.get('/addInmo',(req,res)=>{
    res.render('auth/addInmo');
});
router.get('/panel',(req,res)=>{
    res.render('links/panel');
});
router.get('/addAnuncio',(req,res)=>{
    res.render('links/addAnuncio');
});
router.get('/listAnuncios',(req,res)=>{
    res.render('links/listAnuncios');
});
router.get('/editAnuncio',(req,res)=>{
    res.render('links/editAnuncio');
});
router.get('/verAnuncio',(req,res)=>{
    res.render('links/verAnuncio');
});
router.get('/listMensajes',(req,res)=>{
    res.render('links/listMensajes');
});



module.exports=router;