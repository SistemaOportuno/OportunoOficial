const express=require('express');
const router=express.Router();
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');

router.get('/',(req,res)=>{
    res.render('public/inicio');
});

router.get('/lista',(req,res)=>{
    res.render('public/lista');
});

router.get('/anuncio',(req,res)=>{
    res.render('public/anuncio');
});

router.get('/addPropietario',(req,res)=>{
    res.render('public/addPropietario');
});
router.get('/addAgente',(req,res)=>{
    res.render('public/addAgente');
});
router.get('/addInmo',(req,res)=>{
    res.render('public/addInmo');
});
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
router.get('/adminPanel',(req,res)=>{
    res.render('admin/adminPanel');
});
router.get('/componentes',(req,res)=>{
    res.render('admin/componentes');
});
router.get('/tiposInmuebles',(req,res)=>{
    res.render('admin/tiposInmuebles');
});
router.get('/grupoCaracteristicas',(req,res)=>{
    res.render('admin/grupoCaracteristicas');
});
router.get('/caracteristicas',(req,res)=>{
    res.render('admin/caracteristicas');
});
router.get('/provincias',(req,res)=>{
    res.render('admin/provincias');
});
router.get('/cantones',(req,res)=>{
    res.render('admin/cantones');
});
router.get('/zonas',(req,res)=>{
    res.render('admin/zonas');
});
router.get('/preguntas',(req,res)=>{
    res.render('admin/Preguntas');
});
router.get('/adminAnuncios',(req,res)=>{
    res.render('admin/adminAnuncios');
});
router.get('/adminUsuarios',(req,res)=>{
    res.render('admin/adminUsuarios');
});
router.get('/usuarioAnuncios',(req,res)=>{
    res.render('admin/usuarioAnuncios');
});
router.get('/adminMensajes',(req,res)=>{
    res.render('admin/adminMensajes');
});









module.exports=router;