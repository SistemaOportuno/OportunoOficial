const express = require('express');
const router = express.Router();
const passport = require('passport');
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
    var filtro = {
        transaccion: '',
        provincia: '',
        canton: '',
        zona: '',
        tipo: '',
        costo_min: '',
        costo_max: '',
        area_min: '',
        area_max: '',
        habitaciones: '',
        banos: '',
        garajes: ''
    }
    var transaccion = {};
    var id_provincia = '';
    var id_canton = '';
    var id_zona = '';
    var query = "SELECT * FROM anuncios WHERE anun_estado='ACTIVO'";
    //transaccion on=arrendar, off=comprar
    if (req.body.transaccion) {
        transaccion.ischeck = true;
        query += " AND anun_transaccion='ARRENDAR'";
        filtro.transaccion = 'ARRENDAR';
    } else {
        query += " AND anun_transaccion='COMPRAR'";
        filtro.transaccion = 'COMPRAR';
    }
    //provincias
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    provincias.forEach(element => {
        if (slugify(element.PROV_NOMBRE) === slugify(req.body.administrative_area_level_1)) {
            element.ischeck = true;
            id_provincia = element.PROV_ID;
            filtro.provincia = element.PROV_NOMBRE;
        }
    });
    //cantones
    const cantones = await db.query("SELECT * FROM cantones WHERE prov_id=? AND cant_estado='ACTIVO'", [id_provincia]);
    cantones.forEach(element => {
        if (slugify(element.CANT_NOMBRE) === slugify(req.body.locality)) {
            element.ischeck = true;
            id_canton = element.CANT_ID;
            filtro.canton = element.CANT_NOMBRE;
        }
    });
    //zonas
    const zonas = await db.query("SELECT * FROM zonas WHERE cant_id=? AND zon_estado='ACTIVO'", [id_canton]);
    zonas.forEach(element => {
        if (slugify(element.ZON_NOMBRE) === slugify(req.body.street_number) || slugify(element.ZON_NOMBRE) === slugify(req.body.route)
            || slugify(element.ZON_NOMBRE) === slugify(req.body.administrative_area_level_2) || slugify(element.ZON_NOMBRE) === slugify(req.body.sublocality_level_1)
            || slugify(element.ZON_NOMBRE) === slugify(req.body.sublocality)) {
            element.ischeck = true;
            id_zona = element.ZON_ID;
            filtro.zona = element.ZON_NOMBRE;
        }
    });
    if (id_provincia != '') {
        query += " AND prov_id=" + id_provincia;
    }
    if (id_canton != '') {
        query += " AND cant_id=" + id_canton;
    }
    if (id_zona != '') {
        query += " AND zon_id=" + id_zona;
    }

    //precio
    const costo_min = req.body.costo_min;
    const costo_max = req.body.costo_max;
    filtro.costo_min = costo_min;
    filtro.costo_max = costo_max;
    query += " AND anun_precio >=" + costo_min + " AND anun_precio<=" + costo_max;

    //tipos inmmuebles
    const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO'");
    if (req.body.checks) {
        var in_states = '';
        tipos_inmuebles.forEach(element => {
            if (Array.isArray(req.body.checks)) {
                req.body.checks.forEach(function (i, idx, array) {
                    if (i == element.TIPINM_ID) {
                        element.ischeck = true;
                        if (idx === array.length - 1) {
                            in_states += element.TIPINM_ID + "";
                            filtro.tipo += element.TIPINM_DESCRIPCION;
                        } else {
                            in_states += element.TIPINM_ID + ",";
                            filtro.tipo += element.TIPINM_DESCRIPCION + ', ';
                        }
                    }

                });
            } else {
                if (req.body.checks == element.TIPINM_ID) {
                    element.ischeck = true;
                    query += " AND tipinm_id=" + element.TIPINM_ID;
                    filtro.tipo = element.TIPINM_DESCRIPCION;
                }
            }
        });
        if (in_states != '') {
            query += " AND tipinm_id in (" + in_states + ")"
        }
    }
    console.log(query);
    res.render('public/lista', { transaccion, provincias, zonas, cantones, costo_min, costo_max, tipos_inmuebles, filtro });
});
router.post('/modifylist', async (req, res) => {
    var filtro = {
        transaccion: '',
        provincia: '',
        canton: '',
        zona: '',
        tipo: '',
        costo_min: '',
        costo_max: '',
        area_min: '',
        area_max: '',
        habitaciones: '',
        banos: '',
        garajes: ''
    }
    var transaccion = {};
    var id_provincia = '';
    var id_canton = '';
    var id_zona = '';
    var query = "SELECT * FROM anuncios WHERE anun_estado='ACTIVO'";
    if (req.body.transaccion) {
        transaccion.ischeck = true;
        query += " AND anun_transaccion='ARRENDAR'";
        filtro.transaccion = 'ARRENDAR';
    } else {
        query += " AND anun_transaccion='COMPRAR'";
        filtro.transaccion = 'COMPRAR';
    }
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    provincias.forEach(element => {
        if (element.PROV_ID + "" === req.body.id_provincia) {
            element.ischeck = true;
            id_provincia = element.PROV_ID;
            filtro.provincia = element.PROV_NOMBRE;
        }
    });
    //cantones
    const cantones = await db.query("SELECT * FROM cantones WHERE prov_id=? AND cant_estado='ACTIVO'", [id_provincia]);
    cantones.forEach(element => {
        if (element.CANT_ID + "" === req.body.id_canton) {
            element.ischeck = true;
            id_canton = element.CANT_ID;
            filtro.canton = element.CANT_NOMBRE
        }
    });
    const zonas = await db.query("SELECT * FROM zonas WHERE cant_id=? AND zon_estado='ACTIVO'", [id_canton]);
    zonas.forEach(element => {
        if (element.ZON_ID + "" === req.body.id_zona) {
            element.ischeck = true;
            id_zona = element.ZON_ID;
            filtro.zona = element.ZON_NOMBRE
        }
    });
    if (id_provincia != '') {
        query += " AND prov_id=" + id_provincia;
    }
    if (id_canton != '') {
        query += " AND cant_id=" + id_canton;
    }
    if (id_zona != '') {
        query += " AND zon_id=" + id_zona;
    }
    //precio
    const costo_min = req.body.costo_min;
    const costo_max = req.body.costo_max;
    const area_min = req.body.area_min;
    const area_max = req.body.area_max;

    filtro.area_max = area_max;
    filtro.area_min = area_min;
    filtro.costo_min = costo_min;
    filtro.costo_max = costo_max;
    if (costo_min != '') {
        query += " AND anun_precio>=" + costo_min;
    }
    if (costo_max != '') {
        query += " AND anun_precio<=" + costo_max;
    }
    if (area_min != '') {
        query += " AND anun_tamano_total>=" + area_min;
    }
    if (area_max != '') {
        query += " AND anun_tamano_total<=" + area_max;
    }

    //tipos inmmuebles
    const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO'");
    tipos_inmuebles.forEach(element => {
        if (req.body.id_tipo === element.TIPINM_ID + "") {
            element.ischeck = true;
            query += " AND tipinm_id=" + element.TIPINM_ID;
            filtro.tipo = element.TIPINM_DESCRIPCION;
        }
    });
    var btn = {};
    if (req.body.btn_habitaciones) {
        btn.habitaciones = req.body.btn_habitaciones;
    } else {
        if (req.body.bt_habitaciones) {
            btn.habitaciones = req.body.bt_habitaciones;
        }
    }
    if (btn.habitaciones == 4) {
        filtro.habitaciones = '4+';
        query += " AND anun_habitaciones >=4"
    } else {
        filtro.habitaciones = btn.habitaciones;
        if (btn.habitaciones != undefined) {
            query += " AND anun_habitaciones <=" + btn.habitaciones;
        }
    }
    if (req.body.btn_banos) {
        btn.banos = req.body.btn_banos

    } else {
        if (req.body.bt_banos) {
            btn.banos = req.body.bt_banos
        }
    }
    if (btn.banos == 4) {
        filtro.banos = '4+';
        query += " AND anun_banos >=4"
    } else {
        filtro.banos = btn.banos;
        if (btn.banos != undefined) {
            query += " AND anun_banos <=" + btn.banos;
        }
    }
    if (req.body.btn_garajes) {
        btn.garajes = req.body.btn_garajes
    } else {
        if (req.body.bt_garajes) {
            btn.garajes = req.body.bt_garajes
        }
    }
    if (btn.garajes == 4) {
        filtro.garajes = '4+';
        query += " AND anun_estacionamiento >=4"
    } else {
        filtro.garajes = btn.garajes;
        if (btn.garajes != undefined) {
            query += " AND anun_estacionamiento <=" + btn.garajes;
        }
    }
    console.log(query);
    res.render('public/lista', { transaccion, provincias, cantones, zonas, costo_min, costo_max, area_min, area_max, tipos_inmuebles, btn, filtro });
});

router.get('/anuncio', (req, res) => {
    res.render('public/anuncio');
});

module.exports = router;