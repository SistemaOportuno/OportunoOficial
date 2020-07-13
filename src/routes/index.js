const express=require('express');
const router=express.Router();
const db = require('../database');


router.get('/',async(req,res)=>{
    const tipos_inmuebles= await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO';");
    res.render('public/inicio',{tipos_inmuebles});
});










module.exports=router;