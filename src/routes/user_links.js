
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
}).fields([{ name: "anuncio_images" }, { name: "anuncio_planos" }]);//.array('anuncio_images');



const storage_logo = multer.diskStorage({
    destination: path.join(__dirname, '../public/inmo_logo'),
    filename: (req, file, cb) => {
        cb(null, uuid.v4() + path.extname(file.originalname).toLocaleLowerCase());
    }
})
const update_logo = multer({
    storage: storage_logo,
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
router.get('/panel', isUserLog, (req, res) => {
    res.render('user/panel');
});
router.get('/addAnuncio', isUserLog, async (req, res) => {
    //const row= await db.query("SELECT count(USU_ID) as n FROM anuncios WHERE usu_id=?",req.user.USU_ID);
    //const count=row[0].n;
    if (req.user.USU_HABILITADO /*|| count<1*/) {
        const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
        const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO'");
        const grupos_caracteristicas = await db.query("SELECT * FROM grupos_caracteristicas WHERE grup_estado='ACTIVO'");
        grupos_caracteristicas.forEach(async (element) => {
            element.caracteristicas = await db.query("SELECT * FROM caracteristicas WHERE caract_estado='ACTIVO' AND grup_id=?", [element.GRUP_ID]);
        });
        res.render('user/addAnuncio', { tipos_inmuebles, grupos_caracteristicas, provincias });
    } else {
        req.flash('success', 'Póngase en contacto con nosotros para gestionar la habilitación de publicación mas anuncios');
        res.redirect('/contactar');
    }

});
router.post('/addAnuncio', update_image, async (req, res) => {
    const new_anuncio = {
        USU_ID: req.user.USU_ID,
        TIPINM_ID: req.body.TIPINM_ID,
        ZON_ID: req.body.ZON_ID,
        CANT_ID: req.body.CANT_ID,
        PROV_ID: req.body.PROV_ID,
        ANUN_TITULO: req.body.ANUN_TITULO,
        ANUN_DESCRIPCION: req.body.ANUN_DESCRIPCION ? req.body.ANUN_DESCRIPCION : "",
        ANUN_TRANSACCION: req.body.ANUN_TRANSACCION ? req.body.ANUN_TRANSACCION : "",
        ANUN_TAMANO_TOTAL: req.body.ANUN_TAMANO_TOTAL ? req.body.ANUN_TAMANO_TOTAL : 0,
        ANUN_TAMANO_CONSTRUCCION: req.body.ANUN_TAMANO_CONSTRUCCION ? req.body.ANUN_TAMANO_CONSTRUCCION : 0,
        ANUN_PRECIO: req.body.ANUN_PRECIO ? req.body.ANUN_PRECIO : 0,
        ANUN_ALICUOTA: req.body.ANUN_ALICUOTA ? req.body.ANUN_ALICUOTA : 0,
        ANUN_HABITACIONES: req.body.ANUN_HABITACIONES ? req.body.ANUN_HABITACIONES : 0,
        ANUN_BANOS: req.body.ANUN_BANOS ? req.body.ANUN_BANOS : 0,
        ANUN_M_BANOS: req.body.ANUN_M_BANOS ? req.body.ANUN_M_BANOS : 0,
        ANUN_ESTACIONAMIENTO: req.body.ANUN_ESTACIONAMIENTO ? req.body.ANUN_ESTACIONAMIENTO : 0,
        ANUN_ANTIGUEDAD: req.body.ANUN_ANTIGUEDAD ? req.body.ANUN_ANTIGUEDAD : 0,
        ANUN_DIRECCION: req.body.ANUN_DIRECCION ? req.body.ANUN_DIRECCION : "",
        ANUN_LATITUD: req.body.ANUN_LATITUD ? req.body.ANUN_LATITUD : 0,
        ANUN_LONGITUD: req.body.ANUN_LONGITUD ? req.body.ANUN_LONGITUD : 0,
        ANUN_FECHA: helpers.fecha_actual(),
        ANUN_TIPO: "NORMAL",
        ANUN_ESTADO_CONSTR: req.body.ANUN_ESTADO_CONSTR ? req.body.ANUN_ESTADO_CONSTR : "",
        ANUN_EMBEBED: req.body.ANUN_EMBEBED ? req.body.ANUN_EMBEBED : "",
        ANUN_ESTADO: "ACTIVO"
    }
    const result = await db.query('INSERT INTO anuncios SET ? ', new_anuncio);
    if(req.files.anuncio_images){
        req.files.anuncio_images.forEach(async element => {
            const new_image = {
                ANUN_ID: result.insertId,
                IMG_NOMBRE: element.filename,
                IMG_TIPO: 'FOTO'
            }
            await db.query('INSERT INTO imagenes SET ? ', new_image);
        });
    }
    if(req.files.anuncio_planos){
        req.files.anuncio_planos.forEach(async element => {
            const new_image = {
                ANUN_ID: result.insertId,
                IMG_NOMBRE: element.filename,
                IMG_TIPO: 'PLANO'
            }
            await db.query('INSERT INTO imagenes SET ? ', new_image);
        });
    }
    if (Array.isArray(req.body.CARACT_ID)) {
        req.body.CARACT_ID.forEach(async element => {
            const new_cract = {
                ANUN_ID: result.insertId,
                CARACT_ID: element
            }
            await db.query('INSERT INTO anuncio_caracteristica SET ? ', new_cract);
        });
    } else if (req.body.CARACT_ID != undefined) {
        const new_cract = {
            ANUN_ID: result.insertId,
            CARACT_ID: req.body.CARACT_ID
        }
        await db.query('INSERT INTO anuncio_caracteristica SET ? ', new_cract);
    }
    req.flash('success', 'Anuncio Creado exitosamente');

    res.redirect('/listAnuncios');
});
router.get('/getCantones/:PROV_ID', isUserLog, async (req, res, next) => {
    const { PROV_ID } = req.params;
    const cantones = await db.query("SELECT * FROM cantones WHERE cant_estado='ACTIVO' AND prov_id=?", PROV_ID);
    res.send(cantones);
});
router.get('/getZonas/:CANT_ID', isUserLog, async (req, res, next) => {
    const { CANT_ID } = req.params;
    const zonas = await db.query("SELECT * FROM zonas WHERE zon_estado='ACTIVO' AND cant_id=?", CANT_ID);
    res.send(zonas);
});
router.get('/deleteImage/:IMG_ID/:IMG_NOMBRE', isUserLog, async (req, res, next) => {
    const { IMG_ID } = req.params;
    const { IMG_NOMBRE } = req.params;
    await db.query("DELETE FROM imagenes WHERE img_id=?", IMG_ID);
    fs.unlink(path.join(__dirname,'../public/anuncio_images/' + IMG_NOMBRE), (err) => {
        if (err) {
            console.log(err); throw err;
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
        const aux = await db.query('SELECT count(anmsg_id) as msg FROM anuncios_mensajes WHERE anun_id=? AND anmsg_estado="ACTIVO"', element.ANUN_ID);
        element.MENSAJES = aux[0].msg;
    });
    res.render('user/listAnuncios', { anuncios });
});
router.get('/editAnuncio/:ANUN_ID', isUserLog, async (req, res) => {
    const { ANUN_ID } = req.params;

    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO'");
    const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO'");
    const rows = await db.query('SELECT * FROM anuncios WHERE anun_estado!="ELIMINADO" AND usu_id=? AND anun_id=?', [req.user.USU_ID, ANUN_ID]);
    const anuncio = rows[0];
    anuncio.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=? and img_tipo="FOTO"', anuncio.ANUN_ID);
    anuncio.PLANOS = await db.query('SELECT * FROM imagenes WHERE anun_id=? and img_tipo="PLANO"', anuncio.ANUN_ID);

    anuncio.CARACTERISTICAS = await db.query('SELECT * FROM anuncio_caracteristica ac, caracteristicas c WHERE anun_id=? AND c.CARACT_ID=ac.CARACT_ID', anuncio.ANUN_ID);
    const grupos_caracteristicas = await db.query("SELECT * FROM grupos_caracteristicas WHERE grup_estado='ACTIVO'");
    grupos_caracteristicas.forEach(async (element) => {
        element.caracteristicas = await db.query("SELECT * FROM caracteristicas WHERE caract_estado='ACTIVO' AND grup_id=?", [element.GRUP_ID]);
        element.caracteristicas.forEach(async car => {
            anuncio.CARACTERISTICAS.forEach(async ancar => {
                if (car.CARACT_ID == ancar.CARACT_ID) {
                    car.ISCHECK = true;
                }
            });
        });
    });
    const cantones = await db.query('SELECT * FROM cantones WHERE prov_id=?', anuncio.PROV_ID);
    const zonas = await db.query('SELECT * FROM zonas WHERE cant_id=?', anuncio.CANT_ID);


    res.render('user/editAnuncio', { tipos_inmuebles, grupos_caracteristicas, provincias, anuncio, cantones, zonas });

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
        ANUN_EMBEBED: req.body.ANUN_EMBEBED,
        ANUN_ESTADO_CONSTR: req.body.ANUN_ESTADO_CONSTR,
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=? ', [editAnuncio, req.body.ANUN_ID]);
    if (req.files.anuncio_images) {
        req.files.anuncio_images.forEach(async element => {
            const new_image = {
                ANUN_ID: req.body.ANUN_ID,
                IMG_NOMBRE: element.filename,
                IMG_TIPO: 'FOTO'

            }
            await db.query('INSERT INTO imagenes SET ? ', new_image);
        });
    }
    if (req.files.anuncio_planos) {
        req.files.anuncio_planos.forEach(async element => {
            const new_image = {
                ANUN_ID: req.body.ANUN_ID,
                IMG_NOMBRE: element.filename,
                IMG_TIPO: 'PLANO'

            }
            await db.query('INSERT INTO imagenes SET ? ', new_image);
        });
    }
    await db.query('DELETE FROM anuncio_caracteristica WHERE anun_id=?', req.body.ANUN_ID);
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
    const rows = await db.query('SELECT *, DATE_FORMAT(ANUN_FECHA,"%Y-%m-%d") as FECHA FROM anuncios WHERE anun_estado!="ELIMINADO" AND usu_id=? AND anun_id=?', [req.user.USU_ID, ANUN_ID]);
    const anuncio = rows[0];
    anuncio.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=? AND IMG_TIPO="FOTO"', anuncio.ANUN_ID);
    anuncio.IMAGES.forEach(function (i, idx, array) {
        i.POS = idx;
    });
    anuncio.COUNT_IMAGES=anuncio.IMAGES.length;
    anuncio.PLANOS = await db.query('SELECT * FROM imagenes WHERE anun_id=? AND IMG_TIPO="PLANO"', anuncio.ANUN_ID);
    anuncio.PLANOS.forEach(function (i, idx, array) {
        i.POS = idx;
    });
    anuncio.COUNT_PLANOS=anuncio.PLANOS.length;
    var aux = await db.query('SELECT prov_nombre FROM provincias WHERE prov_id=?', anuncio.PROV_ID);
    anuncio.PROVINCIA = aux[0].prov_nombre;
    aux = await db.query('SELECT cant_nombre FROM cantones WHERE cant_id=?', anuncio.CANT_ID);
    anuncio.CANTON = aux[0].cant_nombre;
    aux = await db.query('SELECT zon_nombre FROM zonas WHERE zon_id=?', anuncio.ZON_ID);
    anuncio.ZONA = aux[0].zon_nombre;
    aux = await db.query('SELECT tipinm_descripcion FROM tipos_inmuebles WHERE tipinm_id=?', anuncio.TIPINM_ID);
    anuncio.TIPINM_DESCRIPCION = aux[0].tipinm_descripcion;

    anuncio.CARACTERISTICAS = await db.query('SELECT * FROM anuncio_caracteristica ac, caracteristicas c WHERE anun_id=? AND c.CARACT_ID=ac.CARACT_ID', anuncio.ANUN_ID);
    res.render('user/verAnuncio', { anuncio });
});
router.post('/bloquearAnuncio', isUserLog, async (req, res) => {
    const update_anuncio = {
        ANUN_ESTADO: 'BLOQUEADO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    res.redirect('/listAnuncios');
});
router.post('/eliminarAnuncio', isUserLog, async (req, res) => {
    const update_anuncio = {
        ANUN_ESTADO: 'ELIMINADO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    res.redirect('/listAnuncios');
});
router.get('/listMensajes', isUserLog, async (req, res) => {
    const mensajes = await db.query('SELECT a.ANUN_ID, a.ANUN_TITULO, am.ANMSG_ID , am.ANUN_ID ,am.ANMSG_NOMBRE, am.ANMSG_CORREO, am.ANMSG_TELEFONO, am.ANMSG_ASUNTO, am.ANMSG_MENSAJE, am.ANMSG_ESTADO, DATE_FORMAT(am.ANMSG_FECHA_VISITA,"%Y-%m-%d") as ANMSG_FECHA_VISITA, DATE_FORMAT(am.ANMSG_FECHA,"%Y-%m-%d") as ANMSG_FECHA  FROM anuncios_mensajes am, anuncios a WHERE am.anun_id= a.anun_id AND am.anmsg_estado="ACTIVO" AND am.anmsg_asunto!="LLAVES EN MANO" AND a.usu_id=?', req.user.USU_ID);

    res.render('user/listMensajes', { mensajes });
});
router.post('/eliminarMensajeAnuncio', isUserLog, async (req, res) => {
    const update_mensaje = {
        ANMSG_ESTADO: 'ELIMINADO'
    }
    await db.query('UPDATE anuncios_mensajes SET ? WHERE ANMSG_ID =?', [update_mensaje, req.body.ANMSG_ID]);
    res.redirect('/listMensajes');
});
router.post('/desbloquearAnuncio', isUserLog, async (req, res) => {
    const update_anuncio = {
        ANUN_ESTADO: 'ACTIVO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    res.redirect('/listAnuncios');
});
router.get('/contactar', isUserLog, async (req, res) => {
    const preguntas = await db.query('SELECT * FROM preguntas WHERE preg_estado="ACTIVO"');
    const correos = await db.query('SELECT * FROM correos WHERE corr_estado="ACTIVO"');
    const telefonos = await db.query('SELECT * FROM telefonos WHERE tel_estado="ACTIVO"');
    const direcciones = await db.query('SELECT * FROM direcciones WHERE dir_estado="ACTIVO"');

    res.render('user/contactar', { preguntas, correos, telefonos, direcciones });
});
router.post('/newUsuarioMensaje', isUserLog, async (req, res) => {
    new_usuario_mensaje = {
        USU_ID: req.user.USU_ID,
        PREG_ID: req.body.PREG_ID,
        USUMSG_MENSAJE: req.body.USUMSG_MENSAJE,
        USUMSG_FECHA: helpers.fecha_actual(),
        USUMSG_ESTADO: "ACTIVO"
    }
    await db.query('INSERT INTO usuarios_mensajes SET?', new_usuario_mensaje);
    req.flash('success', 'Mensaje enviado exitosamente a la Administración');
    res.redirect('/panel');
});
router.get('/cuenta', isUserLog, async (req, res) => {
    const cobertura = await db.query("SELECT * FROM cobertura c, provincias p WHERE c.USU_ID=? AND c.PROV_ID=p.PROV_ID", [req.user.USU_ID]);
    res.render('user/cuenta', { cobertura });
});
router.get('/editarCuenta', isUserLog, async (req, res) => {
    const coberturas = await db.query("SELECT * FROM cobertura  WHERE USU_ID=?", [req.user.USU_ID]);
    const provincias = await db.query("SELECT * FROM provincias  WHERE prov_estado='ACTIVO'");
    provincias.forEach(provincia => {
        coberturas.forEach(cobertura => {
            if (provincia.PROV_ID == cobertura.PROV_ID) {
                provincia.CHECK = true;
            }
        });
    });
    res.render('user/editarCuenta', { provincias });
});
router.post('/editarCuenta', update_logo, isUserLog, async (req, res) => {
    var update_usuario = {};
    if (req.user.USU_TIPO == 'PROPIETARIO' || req.user.USU_TIPO == 'AGENTE') {
        update_usuario = {
            USU_NOMBRE: req.body.USU_NOMBRE,
            USU_APELLIDO: req.body.USU_APELLIDO,
            USU_CORREO: req.body.USU_CORREO,
            USU_TELEFONO: req.body.USU_TELEFONO
        }
    } else if (req.user.USU_TIPO == 'INMOBILIARIA') {
        update_usuario = {
            USU_NOMBRE: req.body.USU_NOMBRE,
            USU_APELLIDO: req.body.USU_APELLIDO,
            USU_CORREO: req.body.USU_CORREO,
            USU_TELEFONO: req.body.USU_TELEFONO,
            USU_EMPRESA: req.body.USU_EMPRESA,
            USU_EMPRESA_CORREO: req.body.USU_EMPRESA_CORREO,
            USU_EMPRESA_TELEFONO: req.body.USU_EMPRESA_TELEFONO,
        }
        if (req.file) {
            update_usuario.USU_EMPRESA_LOGO = req.file.filename;
            fs.unlink(path.join(__dirname,'../public/inmo_logo/' + req.user.USU_EMPRESA_LOGO), (err) => {
                if (err) {
                    console.log(err); throw err;
                }
            });
        }
    }
    await db.query('DELETE FROM cobertura WHERE usu_id=?', req.user.USU_ID);
    if (Array.isArray(req.body.PROV_ID)) {
        req.body.PROV_ID.forEach(async element => {
            const new_cobertura = {
                USU_ID: req.user.USU_ID,
                PROV_ID: element
            }
            await db.query('INSERT INTO cobertura SET ?', new_cobertura);
        });
    } else {
        const new_cobertura = {
            USU_ID: req.user.USU_ID,
            PROV_ID: req.body.PROV_ID
        }
        await db.query('INSERT INTO cobertura SET ?', new_cobertura);
    }
    await db.query('UPDATE usuarios SET ? WHERE usu_id=?', [update_usuario, req.user.USU_ID]);
    req.flash('success', 'Datos modificados correctamente');
    res.redirect('/cuenta');
});
router.get('/editarContrasena', isUserLog, (req, res) => {
    res.render('user/editarContrasena');
});
router.post('/editarContrasena', isUserLog, async (req, res) => {
    if (helpers.comparar(req.body.USU_CONTRASENA, req.user.USU_CONTRASENA)) {
        if (req.body.USU_CONTRASENA_NUEVA == req.body.USU_CONTRASENA_NUEVA_C) {
            update_user = {
                USU_CONTRASENA: helpers.encriptar(req.body.USU_CONTRASENA_NUEVA)
            }
            await db.query('UPDATE usuarios SET ? WHERE usu_id=?', [update_user, req.user.USU_ID]);
            req.flash('success', 'Contraseña cambiada, Inicie sesión Nuevamente');
            res.redirect('/logout');
        } else {
            req.flash('fail', 'Las contraseñas nuevas no coinciden')
        }
    } else {
        req.flash('fail', 'Las contraseña actual es incorrecta')
    }
    res.redirect('/editarContrasena');
});

module.exports = router;