const express = require('express');
const router = express.Router();
const passport = require('passport');
const db = require('../database');
const helpers = require('../lib/helpers');
const { isNotLoggedIn } = require('../lib/auth');
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
    var query = "SELECT *, DATE_FORMAT(ANUN_FECHA,'%Y-%m-%d') as FECHA FROM anuncios WHERE anun_estado='ACTIVO'";
    //transaccion on=arrendar, off=comprar
    if (req.body.transaccion) {
        transaccion.ischeck = true;
        query += " AND anun_transaccion='ARRIENDO'";
        filtro.transaccion = 'ARRENDAR';
    } else {
        query += " AND anun_transaccion='VENTA'";
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
    const anuncios = await db.query(query + " AND anun_estado='ACTIVO' ORDER BY anun_tipo DESC");
    anuncios.forEach(async element => {
        element.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', element.ANUN_ID);
        element.IMAGES.forEach(function (i, idx, array) {
            i.POS = idx;
        });
    });
    res.render('public/lista', { transaccion, provincias, zonas, cantones, costo_min, costo_max, tipos_inmuebles, filtro, anuncios });
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
    var query = "SELECT *, DATE_FORMAT(ANUN_FECHA,'%Y-%m-%d') as FECHA FROM anuncios WHERE anun_estado='ACTIVO'";
    if (req.body.transaccion) {
        transaccion.ischeck = true;
        query += " AND anun_transaccion='ARRIENDO'";
        filtro.transaccion = 'ARRENDAR';
    } else {
        query += " AND anun_transaccion='VENTA'";
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
    const anuncios = await db.query(query + " AND anun_estado='ACTIVO' ORDER BY anun_tipo DESC");
    anuncios.forEach(async element => {
        element.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', element.ANUN_ID);
        element.IMAGES.forEach(function (i, idx, array) {
            i.POS = idx;
        });
    });
    res.render('public/lista', { transaccion, provincias, cantones, zonas, costo_min, costo_max, area_min, area_max, tipos_inmuebles, btn, filtro, anuncios });
});
router.get('/anuncio/:ANUN_ID', async (req, res) => {
    const { ANUN_ID } = req.params;
    const rows = await db.query('SELECT *, DATE_FORMAT(ANUN_FECHA,"%Y-%m-%d") as FECHA FROM anuncios WHERE anun_estado="ACTIVO" AND anun_id=?', [ANUN_ID]);
    const anuncio = rows[0];
    if (anuncio != undefined) {
        if (req.user==undefined || req.user.USU_ID != anuncio.USU_ID) {
            update_anuncio = {
                ANUN_VISTAS: anuncio.ANUN_VISTAS += 1
            }
            await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, anuncio.ANUN_ID]);
        }
        anuncio.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', anuncio.ANUN_ID);
        anuncio.IMAGES.forEach(function (i, idx, array) {
            i.POS = idx;
        });
        var aux = await db.query('SELECT prov_nombre FROM provincias WHERE prov_id=?', anuncio.PROV_ID);
        anuncio.PROVINCIA = aux[0].prov_nombre;
        aux = await db.query('SELECT cant_nombre FROM cantones WHERE cant_id=?', anuncio.CANT_ID);
        anuncio.CANTON = aux[0].cant_nombre;
        aux = await db.query('SELECT zon_nombre FROM zonas WHERE zon_id=?', anuncio.ZON_ID);
        anuncio.ZONA = aux[0].zon_nombre;
        aux = await db.query('SELECT tipinm_descripcion FROM tipos_inmuebles WHERE tipinm_id=?', anuncio.TIPINM_ID);
        anuncio.TIPINM_DESCRIPCION = aux[0].tipinm_descripcion;
        anuncio.TEXTO_COMPARTIR="Inmmokraft presenta y comparte "+helpers.getUrl()+"/anuncio/"+ANUN_ID;
        anuncio.CARACTERISTICAS = await db.query('SELECT * FROM anuncio_caracteristica ac, caracteristicas c WHERE anun_id=? AND c.CARACT_ID=ac.CARACT_ID', anuncio.ANUN_ID);
        res.render('public/anuncio', { anuncio });
    } else {
        res.redirect('/');
    }
});
router.post('/addMensajeCliente', isNotLoggedIn, async (req, res) => {
    new_mensaje = {
        ANUN_ID: req.body.ANUN_ID,
        ANMSG_NOMBRE: req.body.ANMSG_NOMBRE,
        ANMSG_CORREO: req.body.ANMSG_CORREO,
        ANMSG_TELEFONO: req.body.ANMSG_TELEFONO,
        ANMSG_FECHA_VISITA: req.body.ANMSG_FECHA_VISITA,
        ANMSG_FECHA: helpers.fecha_actual(),
        ANMSG_ASUNTO: req.body.ANMSG_ASUNTO,
        ANMSG_MENSAJE: req.body.ANMSG_MENSAJE,
        ANMSG_ESTADO: 'ACTIVO'
    }
    await db.query('INSERT INTO anuncios_mensajes SET ?', [new_mensaje]);
    req.flash('success', 'Mensaje enviado correctamente, muy pronto el anunciante se contactará con usted');
    res.redirect('/anuncio/' + req.body.ANUN_ID);
});
router.get('/empresa', async (req, res) => {
    res.render('public/empresa');
    
});
router.get('/misionYvision', async (req, res) => {
    res.render('public/misionYvision');
    
});
router.get('/terminosYcondiciones', async (req, res) => {
    res.render('public/terminosycondiciones');
    
});


module.exports = router;