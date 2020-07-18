
const express = require('express');
const router = express.Router();
const db = require('../database');
const helpers = require('../lib/helpers');

const { isUserLog } = require('../lib/auth');

const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage_image = multer.diskStorage({
    destination: path.join(__dirname, '../public/anuncio_images'),
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
}).array('anuncio_images');

router.get('/panel', isUserLog, (req, res) => {
    res.render('user/panel');
});
router.get('/addAnuncio', isUserLog, async (req, res) => {
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO'");
    const grupos_caracteristicas = await db.query("SELECT * FROM grupos_caracteristicas WHERE grup_estado='ACTIVO'");
    grupos_caracteristicas.forEach(async (element) => {
        element.caracteristicas = await db.query("SELECT * FROM caracteristicas WHERE caract_estado='ACTIVO' AND grup_id=?", [element.GRUP_ID]);
    });
    res.render('user/addAnuncio', { tipos_inmuebles, grupos_caracteristicas, provincias });
});
router.post('/addAnuncio', update_image, async (req, res) => {
    const new_anuncio = {
        USU_ID: req.user.USU_ID,
        TIPINM_ID: req.body.TIPINM_ID,
        ZON_ID: req.body.ZON_ID,
        CANT_ID: req.body.CANT_ID,
        PROV_ID: req.body.PROV_ID,
        ANUN_TITULO: req.body.ANUN_TITULO,
        ANUN_DESCRIPCION: req.body.ANUN_DESCRIPCION,
        ANUN_TRANSACCION: req.body.ANUN_TRANSACCION,
        ANUN_TAMANO_TOTAL: req.body.ANUN_TAMANO_TOTAL,
        ANUN_TAMANO_CONSTRUCCION: req.body.ANUN_TAMANO_CONSTRUCCION,
        ANUN_PRECIO: req.body.ANUN_PRECIO,
        ANUN_ALICUOTA: req.body.ANUN_ALICUOTA,
        ANUN_HABITACIONES: req.body.ANUN_HABITACIONES,
        ANUN_BANOS: req.body.ANUN_BANOS,
        ANUN_M_BANOS: req.body.ANUN_M_BANOS,
        ANUN_ESTACIONAMIENTO: req.body.ANUN_ESTACIONAMIENTO,
        ANUN_ANTIGUEDAD: req.body.ANUN_ANTIGUEDAD,
        ANUN_DIRECCION: req.body.ANUN_DIRECCION,
        ANUN_LATITUD: req.body.ANUN_LATITUD,
        ANUN_LONGITUD: req.body.ANUN_LONGITUD,
        ANUN_FECHA: helpers.fecha_actual(),
        ANUN_TIPO: "NORMAL",
        ANUN_ESTADO_CONSTR: req.body.ANUN_ESTADO_CONSTR,
        ANUN_ESTADO: "ACTIVO"
    }
    const result = await db.query('INSERT INTO anuncios SET ? ', new_anuncio);
    req.files.forEach(async element => {
        const new_image = {
            ANUN_ID: result.insertId,
            IMG_NOMBRE: element.filename
        }
        await db.query('INSERT INTO imagenes SET ? ', new_image);
    });
    if (Array.isArray(req.body.CARACT_ID)) {
        req.body.CARACT_ID.forEach(async element => {
            const new_cract = {
                ANUN_ID: result.insertId,
                CARACT_ID: element
            }
            await db.query('INSERT INTO anuncio_caracteristica SET ? ', new_cract);
        });
    } else if (req.body.CARACT_ID != undefined) {
        console.log(req.body.CARACT_ID)
        const new_cract = {
            ANUN_ID: result.insertId,
            CARACT_ID: req.body.CARACT_ID
        }
        await db.query('INSERT INTO anuncio_caracteristica SET ? ', new_cract);
    }
    req.flash('success', 'Anuncio Creado exitosamente');

    res.redirect('/listAnuncios');
});
router.get('/getCantones/:PROV_ID', async (req, res, next) => {
    const { PROV_ID } = req.params;
    const cantones = await db.query("SELECT * FROM cantones WHERE cant_estado='ACTIVO' AND prov_id=?", PROV_ID);
    res.send(cantones);
});
router.get('/getZonas/:CANT_ID', async (req, res, next) => {
    const { CANT_ID } = req.params;
    const zonas = await db.query("SELECT * FROM zonas WHERE zon_estado='ACTIVO' AND cant_id=?", CANT_ID);
    res.send(zonas);
});
router.get('/deleteImage/:IMG_ID/:IMG_NOMBRE', async (req, res, next) => {
    const { IMG_ID } = req.params;
    const { IMG_NOMBRE } = req.params;
    await db.query("DELETE FROM imagenes WHERE img_id=?", IMG_ID);
    fs.unlink(path.resolve('./src/public/anuncio_images/'+IMG_NOMBRE),(err)=>{
        if(err){
            console.log(err);throw err;
        }
    });
    res.send('OK');
});
router.get('/listAnuncios', isUserLog, async (req, res) => {
    const anuncios = await db.query('SELECT *, DATE_FORMAT(ANUN_FECHA,"%Y-%m-%d") as FECHA FROM anuncios WHERE anun_estado!="ELIMINADO" AND usu_id=?', req.user.USU_ID);
    anuncios.forEach(async element => {
        element.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', element.ANUN_ID);
        element.IMAGES.forEach(function (i, idx, array) {
            i.POS = idx;
        });
        const aux= await db.query('SELECT count(anmsg_id) as msg FROM anuncios_mensajes WHERE anun_id=?', element.ANUN_ID);
        element.MENSAJES=aux[0].msg;
    });
    res.render('user/listAnuncios', { anuncios });
});
router.get('/editAnuncio/:ANUN_ID', isUserLog, async (req, res) => {
    const { ANUN_ID } = req.params;

    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO'");
    const rows = await db.query('SELECT * FROM anuncios WHERE anun_estado="ACTIVO" AND usu_id=? AND anun_id=?', [req.user.USU_ID, ANUN_ID]);
    const anuncio = rows[0];
    anuncio.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', anuncio.ANUN_ID);
    anuncio.CARACTERISTICAS = await db.query('SELECT * FROM anuncio_caracteristica ac, caracteristicas c WHERE anun_id=? AND c.CARACT_ID=ac.CARACT_ID', anuncio.ANUN_ID);
    const grupos_caracteristicas = await db.query("SELECT * FROM grupos_caracteristicas WHERE grup_estado='ACTIVO'");
    grupos_caracteristicas.forEach(async (element) => {
        element.caracteristicas = await db.query("SELECT * FROM caracteristicas WHERE caract_estado='ACTIVO' AND grup_id=?", [element.GRUP_ID]);
        element.caracteristicas.forEach(async car => {
            anuncio.CARACTERISTICAS.forEach(async ancar => {
                if(car.CARACT_ID==ancar.CARACT_ID){
                    car.ISCHECK=true;
                }
            });
        });
    });
    const cantones=await db.query('SELECT * FROM cantones WHERE prov_id=?',anuncio.PROV_ID);
    const zonas=await db.query('SELECT * FROM zonas WHERE cant_id=?',anuncio.CANT_ID);


    res.render('user/editAnuncio', { tipos_inmuebles, grupos_caracteristicas, provincias, anuncio, cantones,zonas });

});
router.post('/editAnuncio', update_image, async (req, res) => {
    const editAnuncio = {
        TIPINM_ID: req.body.TIPINM_ID,
        ZON_ID: req.body.ZON_ID,
        CANT_ID: req.body.CANT_ID,
        PROV_ID: req.body.PROV_ID,
        ANUN_TITULO: req.body.ANUN_TITULO,
        ANUN_DESCRIPCION: req.body.ANUN_DESCRIPCION,
        ANUN_TRANSACCION: req.body.ANUN_TRANSACCION,
        ANUN_TAMANO_TOTAL: req.body.ANUN_TAMANO_TOTAL,
        ANUN_TAMANO_CONSTRUCCION: req.body.ANUN_TAMANO_CONSTRUCCION,
        ANUN_PRECIO: req.body.ANUN_PRECIO,
        ANUN_ALICUOTA: req.body.ANUN_ALICUOTA,
        ANUN_HABITACIONES: req.body.ANUN_HABITACIONES,
        ANUN_BANOS: req.body.ANUN_BANOS,
        ANUN_M_BANOS: req.body.ANUN_M_BANOS,
        ANUN_ESTACIONAMIENTO: req.body.ANUN_ESTACIONAMIENTO,
        ANUN_ANTIGUEDAD: req.body.ANUN_ANTIGUEDAD,
        ANUN_DIRECCION: req.body.ANUN_DIRECCION,
        ANUN_LATITUD: req.body.ANUN_LATITUD,
        ANUN_LONGITUD: req.body.ANUN_LONGITUD,
        ANUN_FECHA: helpers.fecha_actual(),
        ANUN_TIPO: "NORMAL",
        ANUN_ESTADO_CONSTR: req.body.ANUN_ESTADO_CONSTR,
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=? ', [editAnuncio,req.body.ANUN_ID]);
    if(req.files.length>0){
        req.files.forEach(async element => {
            const new_image = {
                ANUN_ID: req.body.ANUN_ID,
                IMG_NOMBRE: element.filename
            }
            await db.query('INSERT INTO imagenes SET ? ', new_image);
        });
    }
    await db.query('DELETE FROM anuncio_caracteristica WHERE anun_id=?',req.body.ANUN_ID);
    if (Array.isArray(req.body.CARACT_ID)) {
        req.body.CARACT_ID.forEach(async element => {
            const new_cract = {
                ANUN_ID: req.body.ANUN_ID,
                CARACT_ID: element
            }
            await db.query('INSERT INTO anuncio_caracteristica SET ? ', new_cract);
        });
    } else if (req.body.CARACT_ID != undefined) {
        const new_cract = {
            ANUN_ID: req.body.ANUN_ID,
            CARACT_ID: req.body.CARACT_ID
        }
        await db.query('INSERT INTO anuncio_caracteristica SET ? ', new_cract);
    }
    req.flash('success', 'Anuncio Editado exitosamente');

    res.redirect('/listAnuncios');
});
router.get('/verAnuncio/:ANUN_ID', isUserLog, async (req, res) => {
    const { ANUN_ID } = req.params;
    const rows = await db.query('SELECT *, DATE_FORMAT(ANUN_FECHA,"%Y-%m-%d") as FECHA FROM anuncios WHERE anun_estado="ACTIVO" AND usu_id=? AND anun_id=?', [req.user.USU_ID, ANUN_ID]);
    const anuncio = rows[0];
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
    anuncio.TIPINM_DESCRIPCION=aux[0].tipinm_descripcion;

    anuncio.CARACTERISTICAS = await db.query('SELECT * FROM anuncio_caracteristica ac, caracteristicas c WHERE anun_id=? AND c.CARACT_ID=ac.CARACT_ID', anuncio.ANUN_ID);
    res.render('user/verAnuncio', { anuncio });
});
router.post('/bloquearAnuncio', async (req, res) => {
    const update_anuncio={
        ANUN_ESTADO:'BLOQUEADO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?',[update_anuncio, req.body.ANUN_ID]);
    res.redirect('/listAnuncios');
});
router.post('/eliminarAnuncio', async (req, res) => {
    const update_anuncio={
        ANUN_ESTADO:'ELIMINADO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?',[update_anuncio, req.body.ANUN_ID]);
    res.redirect('/listAnuncios');
});
router.get('/listMensajes', isUserLog, (req, res) => {
    res.render('user/listMensajes');
});
router.get('/contactar', isUserLog, (req, res) => {
    res.render('user/contactar');
});
router.get('/cuenta', isUserLog, (req, res) => {
    res.render('user/cuenta');
});
router.get('/editarCuenta', isUserLog, (req, res) => {
    res.render('user/editarCuenta');
});
router.get('/editarContrasena', isUserLog, (req, res) => {
    res.render('user/editarContrasena');
});


module.exports = router;