const express = require('express');
const router = express.Router();
const db = require('../database');
//-----------------------------------FUNCIONES------------------------------
function slugify(str) {
    var map = {
        'A': 'á|à|ã|â|À|Á|Ã|Â',
        'E': 'é|è|ê|É|È|Ê',
        'I': 'í|ì|î|Í|Ì|Î',
        'O': 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
        'U': 'ú|ù|û|ü|Ú|Ù|Û|Ü',
    };

    str = str.toUpperCase();

    for (var pattern in map) {
        str = str.replace(new RegExp(map[pattern], 'g'), pattern);
    };

    return str;
};
//-----------------------------------FUNCIONES------------------------------

router.post('/busqueda', async (req, res) => {
    console.log(req.body);
    var transaccion={};
    var id_provincia='';
    var id_canton='';
    var id_zona='';
    var query="SELECT * FROM anuncios WHERE anun_estado='ACTIVO'";
    //transaccion on=arrendar, off=comprar
    if (req.body.transaccion) {
        transaccion.ischeck = true;
        query+=" AND anun_transaccion='ARRENDAR'";
    }else{
        query+=" AND anun_transaccion='COMPRAR'";
    }
    //provincias
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    provincias.forEach(element => {
        if (slugify(element.PROV_NOMBRE) === slugify(req.body.administrative_area_level_1)) {
            element.ischeck = true;
            id_provincia = element.PROV_ID;
        }
    });
    //cantones
    const cantones = await db.query("SELECT * FROM cantones WHERE prov_id=? AND cant_estado='ACTIVO'", [id_provincia]);
    cantones.forEach(element => {
        if (slugify(element.CANT_NOMBRE) === slugify(req.body.locality)) {
            element.ischeck = true;
            id_canton = element.CANT_ID;
        }
    });
    //zonas
    const zonas = await db.query("SELECT * FROM zonas WHERE cant_id=? AND zon_estado='ACTIVO'", [id_canton]);
    zonas.forEach(element => {
        if (slugify(element.ZON_NOMBRE) === slugify(req.body.street_number) || slugify(element.ZON_NOMBRE) === slugify(req.body.route)
        || slugify(element.ZON_NOMBRE) === slugify(req.body.administrative_area_level_2)|| slugify(element.ZON_NOMBRE) === slugify(req.body.sublocality_level_1)
        || slugify(element.ZON_NOMBRE) === slugify(req.body.sublocality)) {
            element.ischeck = true;
            id_zona = element.ZON_ID;
        }
    });
    if(id_provincia!=''){
        query+=" AND prov_id="+id_provincia;
    }
    if(id_canton!=''){
        query+=" AND cant_id="+id_canton;
    }
    if(id_zona!=''){
        query+=" AND zon_id="+id_zona;
    }
   
    //precio
    const costo_min = req.body.costo_min;
    const costo_max = req.body.costo_max;
    query+=" AND anun_precio >="+costo_min+" AND anun_precio<="+costo_max;

    //tipos inmmuebles
    const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO'");
   
    if (req.body.checks) {
        var in_states='';
        tipos_inmuebles.forEach(element => {
            if(Array.isArray(req.body.checks)){
                req.body.checks.forEach(function(i, idx, array){
                    if(i==element.TIPINM_ID){
                        element.ischeck=true;
                        if (idx === array.length - 1){ 
                            in_states+=element.TIPINM_ID+"";
                        }else{
                            in_states+=element.TIPINM_ID+",";                        }
                    }
                   
                 });

                req.body.checks.forEach(e => {
                    
                });
            }else{
                if(req.body.checks==element.TIPINM_ID){
                    element.ischeck=true;
                    query+=" AND tipinm_id="+element.TIPINM_ID;
                }
            }
        });
        if(in_states!=''){
            query+=" AND tipinm_id in ("+in_states+")"
        }
    }   
    console.log(query);
    res.render('public/lista', {transaccion, provincias, zonas, cantones, costo_min, costo_max,tipos_inmuebles});
});

router.get('/lista', (req, res) => {
    res.render('public/lista');
});

router.get('/anuncio', (req, res) => {
    res.render('public/anuncio');
});

router.get('/addPropietario', (req, res) => {
    res.render('public/addPropietario');
});
router.get('/addAgente', (req, res) => {
    res.render('public/addAgente');
});
router.get('/addInmo', (req, res) => {
    res.render('public/addInmo');
});


module.exports = router;