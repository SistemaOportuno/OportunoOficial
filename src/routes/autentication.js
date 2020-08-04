const express=require('express');
const router=express.Router();
const db = require('../database');

const passport= require('passport');
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');

const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage_image = multer.diskStorage({
    destination: path.join(__dirname, '../public/inmo_logo'),
    filename: (req, file, cb) => {
        cb(null, uuid.v4() + path.extname(file.originalname).toLocaleLowerCase());
    }
})
const update_image = multer({
    storage: storage_image,
    fileFilter: function (req, file, cb) {
        var filetypes = /jpeg|jpg|png|gif/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: Solo son permitidos los archivos de tipo imagen:  - " + filetypes);
    },
}).single('logo');



router.get('/addPropietario',isNotLoggedIn, async (req, res) => {
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    res.render('public/addPropietario', { provincias });
});
router.post('/addPropietario', passport.authenticate('local.addPropietario', {
    successRedirect: 'panel',
    failureRedirect: '/addPropietario',
    failureFlash: true
}));

router.get('/addAgente',isNotLoggedIn,async (req, res) => {
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    res.render('public/addAgente', { provincias });
});
router.post('/addAgente', passport.authenticate('local.addAgente', {
    successRedirect: 'panel',
    failureRedirect: '/addAgente',
    failureFlash: true
}));

router.get('/addInmo',isNotLoggedIn, async (req, res) => {
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    res.render('public/addInmo',{ provincias });
});
router.post('/addInmo',update_image, passport.authenticate('local.addInmo', {
    successRedirect: 'panel',
    failureRedirect: '/addInmo',
    failureFlash: true
}));

router.get('/login',isNotLoggedIn, async (req, res) => {
    res.render('auth/login');
});
router.get('/adminLogin',isNotLoggedIn, async (req, res) => {
    res.render('auth/AdminLogin');
});

router.post('/login',(req,res,next)=>{
    passport.authenticate('local.login',{
        successRedirect:'/panel',
        failureRedirect:'/login',
        failureFlash:true
    })(req,res,next);
});
router.post('/admnLogin',(req,res,next)=>{
    passport.authenticate('local.adminLogin',{
        successRedirect:'/adminPanel',
        failureRedirect:'/adminLogin',
        failureFlash:true
    })(req,res,next);
});

router.get('/logout',isLoggedIn,(req, res)=>{
    req.logOut();
    res.redirect('/');
});

module.exports=router;