
const express = require('express');
const router = express.Router();
const db = require('../database');


router.get('/panel',(req,res)=>{
    res.render('user/panel');
});
router.get('/addAnuncio',(req,res)=>{
    res.render('user/addAnuncio');
});
router.get('/listAnuncios',(req,res)=>{
    res.render('user/listAnuncios');
});
router.get('/editAnuncio',(req,res)=>{
    res.render('user/editAnuncio');
});
router.get('/verAnuncio',(req,res)=>{
    res.render('user/verAnuncio');
});
router.get('/listMensajes',(req,res)=>{
    res.render('user/listMensajes');
});
router.get('/contactar',(req,res)=>{
    res.render('user/contactar');
});
router.get('/cuenta',(req,res)=>{
    res.render('user/cuenta');
});
router.get('/editarCuenta',(req,res)=>{
    res.render('user/editarCuenta');
});
router.get('/editarContrasena',(req,res)=>{
    res.render('user/editarContrasena');
});


module.exports=router;