const express = require('express');
const router = express.Router();
const db = require('../database');
const { isAdminLog } = require('../lib/auth');
const helpers = require('../lib/helpers');

const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage_image = multer.diskStorage({
    destination: path.join(__dirname, '../public/logo_empresa'),
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
}).single('empresa_logo');

router.get('/adminPanel', isAdminLog, (req, res) => {
    res.render('admin/adminPanel');
});
router.get('/componentes', isAdminLog, (req, res) => {
    res.render('admin/componentes');
});
//----------------------TIPOS INMUEBLES----------------------------
router.get('/tiposInmuebles', isAdminLog, async (req, res) => {
    const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO';")
    res.render('admin/tiposInmuebles', { tipos_inmuebles });
});

router.post('/add_tipo_inmueble', isAdminLog, async (req, res) => {
    const new_tipo_inmueble = {
        TIPINM_DESCRIPCION: req.body.TIPINM_DESCRIPCION,
        TIPINM_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO tipos_inmuebles set ?", [new_tipo_inmueble]);
    req.flash('success', 'Tipo de Inmueble guardado exitosamente');
    res.redirect('/tiposInmuebles');
});
router.post('/edit_tipo_inmueble', isAdminLog, async (req, res) => {
    const edit_tipo_inmueble = {
        TIPINM_DESCRIPCION: req.body.TIPINM_DESCRIPCION
    }
    await db.query("UPDATE tipos_inmuebles SET ? WHERE tipinm_id=?;", [edit_tipo_inmueble, req.body.TIPINM_ID]);
    req.flash('success', 'Tipo de Inmueble editado exitosamente');
    res.redirect('/tiposInmuebles');
});
router.post('/delete_tipo_inmueble', isAdminLog, async (req, res) => {
    const edit_tipo_inmueble = {
        TIPINM_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE tipos_inmuebles SET ? WHERE tipinm_id=?;", [edit_tipo_inmueble, req.body.TIPINM_ID]);
    req.flash('success', 'Tipo de Inmueble eliminado exitosamente');
    res.redirect('/tiposInmuebles');
});
//----------------------TIPOS INMUEBLES----------------------------
//----------------------GRUPO CARACTERISTICAS----------------------------
router.get('/grupoCaracteristicas', isAdminLog, async (req, res) => {
    const grupo_caracteristicas = await db.query("SELECT * FROM grupos_caracteristicas WHERE grup_estado='ACTIVO';")
    grupo_caracteristicas.forEach(async (element) => {
        element.caracteristicas = await db.query("SELECT caract_descripcion FROM caracteristicas WHERE grup_id=? AND caract_estado='ACTIVO';", [element.GRUP_ID]);
    });
    res.render('admin/grupoCaracteristicas', { grupo_caracteristicas });
});
router.post('/add_grupo_caracteristicas', isAdminLog, async (req, res) => {
    const new_grupo_caracteristicas = {
        GRUP_DESCRIPCION: req.body.GRUP_DESCRIPCION,
        GRUP_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO grupos_caracteristicas SET ?", [new_grupo_caracteristicas]);
    req.flash('success', 'Grupo de Características guardado exitosamente');
    res.redirect('/grupoCaracteristicas');
});
router.post('/edit_grupo_caracteristicas', isAdminLog, async (req, res) => {
    const edit_grupo_caracteristicas = {
        GRUP_DESCRIPCION: req.body.GRUP_DESCRIPCION
    }
    await db.query("UPDATE grupos_caracteristicas SET ? WHERE grup_id=?;", [edit_grupo_caracteristicas, req.body.GRUP_ID]);
    req.flash('success', 'Grupo de características editado exitosamente');
    res.redirect('/grupoCaracteristicas');
});
router.post('/delete_grupo_caracteristicas', isAdminLog, async (req, res) => {
    const edit_grupo_caracteristicas = {
        GRUP_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE grupos_caracteristicas SET ? WHERE grup_id=?;", [edit_grupo_caracteristicas, req.body.GRUP_ID]);
    req.flash('success', 'Grupo de Características eliminado exitosamente');
    res.redirect('/grupoCaracteristicas');
});
//----------------------GRUPO CARACTERITICAS----------------------------
//----------------------CARACTERISTICAS----------------------------
router.get('/caracteristicas/:GRUP_ID', isAdminLog, async (req, res) => {
    const { GRUP_ID } = req.params;
    const row = await db.query("SELECT * FROM grupos_caracteristicas WHERE grup_id=? AND grup_estado='ACTIVO';", [GRUP_ID])
    const caracteristicas = await db.query("SELECT * FROM caracteristicas WHERE  grup_id=? AND caract_estado='ACTIVO';", [GRUP_ID])
    const grupo = row[0];
    res.render('admin/caracteristicas', { caracteristicas, grupo });
});
router.post('/add_caracteristica', isAdminLog, async (req, res) => {
    const new_caracteristica = {
        GRUP_ID: req.body.GRUP_ID,
        CARACT_DESCRIPCION: req.body.CARACT_DESCRIPCION,
        CARACT_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO caracteristicas SET ?", [new_caracteristica]);
    req.flash('success', 'Característica guardada exitosamente');
    res.redirect('/caracteristicas/' + req.body.GRUP_ID);
});
router.post('/edit_caracteristica', isAdminLog, async (req, res) => {
    const edit_caracteristica = {
        CARACT_DESCRIPCION: req.body.CARACT_DESCRIPCION
    }
    await db.query("UPDATE caracteristicas SET ? WHERE caract_id=?;", [edit_caracteristica, req.body.CARACT_ID]);
    req.flash('success', 'Característica editada exitosamente');
    res.redirect('/caracteristicas/' + req.body.GRUP_ID);
});
router.post('/delete_caracteristica', isAdminLog, async (req, res) => {
    const edit_caracteristica = {
        CARACT_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE caracteristicas SET ? WHERE caract_id=?;", [edit_caracteristica, req.body.CARACT_ID]);
    req.flash('success', 'Característica eliminada exitosamente');
    res.redirect('/caracteristicas/' + req.body.GRUP_ID);
});
//----------------------CARACTERISTICAS----------------------------
//----------------------PROVINCIAS----------------------------
router.get('/provincias', isAdminLog, async (req, res) => {
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO';")
    res.render('admin/provincias', { provincias });
});
router.post('/add_provincia', isAdminLog, async (req, res) => {
    const new_provincia = {
        PROV_NOMBRE: req.body.PROV_NOMBRE,
        PROV_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO provincias SET ?", [new_provincia]);
    req.flash('success', 'Provincia guardada exitosamente');
    res.redirect('/provincias');
});
router.post('/edit_provincia', isAdminLog, async (req, res) => {
    const edit_provincia = {
        PROV_NOMBRE: req.body.PROV_NOMBRE
    }
    await db.query("UPDATE provincias SET ? WHERE prov_id=?;", [edit_provincia, req.body.PROV_ID]);
    req.flash('success', 'Provincia editada exitosamente');
    res.redirect('/provincias');
});
router.post('/delete_provincia', isAdminLog, async (req, res) => {
    const edit_provincia = {
        PROV_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE provincias SET ? WHERE prov_id=?;", [edit_provincia, req.body.PROV_ID]);
    req.flash('success', 'Provincia eliminada exitosamente');
    res.redirect('/provincias');
});
//----------------------PROVINCIAS----------------------------
//----------------------CANTONES----------------------------
router.get('/cantones/:PROV_ID', isAdminLog, async (req, res) => {
    const { PROV_ID } = req.params;
    const row = await db.query("SELECT * FROM provincias WHERE prov_id=? AND prov_estado='ACTIVO';", [PROV_ID])
    const cantones = await db.query("SELECT * FROM cantones WHERE  prov_id=? AND cant_estado='ACTIVO';", [PROV_ID])
    const provincia = row[0];
    res.render('admin/cantones', { cantones, provincia });
});
router.post('/add_canton', isAdminLog, async (req, res) => {
    const new_canton = {
        PROV_ID: req.body.PROV_ID,
        CANT_NOMBRE: req.body.CANT_NOMBRE,
        CANT_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO cantones SET ?", [new_canton]);
    req.flash('success', 'Cantón guardado exitosamente');
    res.redirect('/cantones/' + req.body.PROV_ID);
});
router.post('/edit_canton', isAdminLog, async (req, res) => {
    const edit_canton = {
        CANT_NOMBRE: req.body.CANT_NOMBRE
    }
    await db.query("UPDATE cantones SET ? WHERE cant_id=?;", [edit_canton, req.body.CANT_ID]);
    req.flash('success', 'Cantón editado exitosamente');
    res.redirect('/cantones/' + req.body.PROV_ID);
});
router.post('/delete_canton', isAdminLog, async (req, res) => {
    const edit_canton = {
        CANT_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE cantones SET ? WHERE cant_id=?;", [edit_canton, req.body.CANT_ID]);
    req.flash('success', 'Cantón eliminado exitosamente');
    res.redirect('/cantones/' + req.body.PROV_ID);
});
//----------------------CANTONES----------------------------
//----------------------ZONAS----------------------------
router.get('/zonas/:CANT_ID', isAdminLog, async (req, res) => {
    const { CANT_ID } = req.params;
    const row = await db.query("SELECT * FROM cantones WHERE cant_id=? AND cant_estado='ACTIVO';", [CANT_ID])
    const zonas = await db.query("SELECT * FROM zonas WHERE  cant_id=? AND zon_estado='ACTIVO';", [CANT_ID])
    const canton = row[0];
    res.render('admin/zonas', { canton, zonas });
});
router.post('/add_zona', isAdminLog, async (req, res) => {
    const new_zona = {
        CANT_ID: req.body.CANT_ID,
        ZON_NOMBRE: req.body.ZON_NOMBRE,
        ZON_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO zonas SET ?", [new_zona]);
    req.flash('success', 'Zona guardada exitosamente');
    res.redirect('/zonas/' + req.body.CANT_ID);
});
router.post('/edit_zona', isAdminLog, async (req, res) => {
    const edit_zona = {
        ZON_NOMBRE: req.body.ZON_NOMBRE
    }
    await db.query("UPDATE zonas SET ? WHERE zon_id=?;", [edit_zona, req.body.ZON_ID]);
    req.flash('success', 'Zona editada exitosamente');
    res.redirect('/zonas/' + req.body.CANT_ID);
});
router.post('/delete_zona', isAdminLog, async (req, res) => {
    const edit_zona = {
        ZON_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE zonas SET ? WHERE zon_id=?;", [edit_zona, req.body.ZON_ID]);
    req.flash('success', 'Zona eliminada exitosamente');
    res.redirect('/zonas/' + req.body.CANT_ID);
});
//----------------------ZONAS----------------------------
//----------------------PREGUNTAS----------------------------
router.get('/preguntas', isAdminLog, async (req, res) => {
    const preguntas = await db.query("SELECT * FROM preguntas WHERE preg_estado='ACTIVO';")
    res.render('admin/Preguntas', { preguntas });
});
router.post('/add_pregunta', isAdminLog, async (req, res) => {
    const new_pregunta = {
        PREG_DESCRIPCION: req.body.PREG_DESCRIPCION,
        PREG_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO preguntas SET ?", [new_pregunta]);
    req.flash('success', 'Pregunta guardada exitosamente');
    res.redirect('/preguntas');
});
router.post('/edit_pregunta', isAdminLog, async (req, res) => {
    const edit_pregunta = {
        PREG_DESCRIPCION: req.body.PREG_DESCRIPCION
    }
    await db.query("UPDATE preguntas SET ? WHERE preg_id=?;", [edit_pregunta, req.body.PREG_ID]);
    req.flash('success', 'Pregunta editada exitosamente');
    res.redirect('/preguntas');
});
router.post('/delete_pregunta', isAdminLog, async (req, res) => {
    const edit_pregunta = {
        PREG_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE preguntas SET ? WHERE preg_id=?;", [edit_pregunta, req.body.PREG_ID]);
    req.flash('success', 'Pregunta eliminada exitosamente');
    res.redirect('/preguntas');
});
//----------------------PREGUNTAS----------------------------
//----------------------EMPRESA----------------------------
router.get('/adminEmpresa', isAdminLog, async (req, res) => {
    const row = await db.query('SELECT * FROM empresa');
    const empresa = row[0];
    res.render('admin/adminEmpresa', { empresa });
});
router.post('/editMision', isAdminLog, async (req, res) => {
    const edit_empresa = {
        EMP_MISION: req.body.EMP_MISION
    }
    await db.query("UPDATE empresa SET ? WHERE emp_id=1;", [edit_empresa]);
    req.flash('success', 'Misión editada exitosamente');
    res.redirect('/adminEmpresa');
});
router.post('/editVision', isAdminLog, async (req, res) => {
    const edit_empresa = {
        EMP_VISION: req.body.EMP_VISION
    }
    await db.query("UPDATE empresa SET ? WHERE emp_id=1;", [edit_empresa]);
    req.flash('success', 'Visión editada exitosamente');
    res.redirect('/adminEmpresa');
});
router.post('/editDescripcion', isAdminLog, async (req, res) => {
    const edit_empresa = {
        EMP_INFO: req.body.EMP_INFO
    }
    await db.query("UPDATE empresa SET ? WHERE emp_id=1;", [edit_empresa]);
    req.flash('success', 'Descripción editada exitosamente');
    res.redirect('/adminEmpresa');
});
router.post('/editLogo', isAdminLog, update_image, async (req, res) => {
    const edit_empresa = {
        EMP_LOGO: req.file.filename
    }
    await db.query("UPDATE empresa SET ? WHERE emp_id=1;", [edit_empresa]);
    fs.unlink(path.resolve('./src/public/logo_empresa/' + req.body.EMP_LOGO), (err) => {
        if (err) {
            console.log(err); throw err;
        }
    });
    req.flash('success', 'Logo editado exitosamente');


    res.redirect('/adminEmpresa');
});
//----------------------EMPRESA----------------------------
//----------------------CONTACTOS----------------------------
router.get('/adminContactos', isAdminLog, async (req, res) => {
    const telefonos = await db.query("SELECT * FROM telefonos WHERE tel_estado='ACTIVO'");
    const correos = await db.query("SELECT * FROM correos WHERE corr_estado='ACTIVO'");
    const direcciones = await db.query("SELECT * FROM direcciones WHERE dir_estado='ACTIVO'");

    res.render('admin/adminContactos', { telefonos, correos, direcciones });
});
router.post('/add_telefono', isAdminLog, async (req, res) => {
    const new_telefono = {
        TEL_NUM: req.body.TEL_NUM,
        TEL_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO telefonos set ?", [new_telefono]);
    req.flash('success', 'Teléfono guardado exitosamente');
    res.redirect('/adminContactos');
});
router.post('/edit_telefono', isAdminLog, async (req, res) => {
    const edit_telefono = {
        TEL_NUM: req.body.TEL_NUM,
    }
    await db.query("UPDATE telefonos SET ? WHERE tel_id=?;", [edit_telefono, req.body.TEL_ID]);
    req.flash('success', 'Teléfono editado exitosamente');
    res.redirect('/adminContactos');
});
router.post('/delete_telefono', isAdminLog, async (req, res) => {
    const edit_telefono = {
        TEL_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE telefonos SET ? WHERE tel_id=?;", [edit_telefono, req.body.TEL_ID]);
    req.flash('success', 'Teléfono eliminado exitosamente');
    res.redirect('/adminContactos');
});
router.post('/add_correo', isAdminLog, async (req, res) => {
    const new_correo = {
        CORR_DIRECCION: req.body.CORR_DIRECCION,
        CORR_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO correos set ?", [new_correo]);
    req.flash('success', 'Correo guardado exitosamente');
    res.redirect('/adminContactos');
});
router.post('/edit_correo', isAdminLog, async (req, res) => {
    const edit_correo = {
        CORR_DIRECCION: req.body.CORR_DIRECCION
    }
    await db.query("UPDATE correos SET ? WHERE corr_id=?;", [edit_correo, req.body.CORR_ID]);
    req.flash('success', 'Correo editado exitosamente');
    res.redirect('/adminContactos');
});
router.post('/delete_correo', isAdminLog, async (req, res) => {
    const edit_correo = {
        CORR_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE correos SET ? WHERE corr_id=?;", [edit_correo, req.body.CORR_ID]);
    req.flash('success', 'Correo eliminado exitosamente');
    res.redirect('/adminContactos');
});
router.post('/add_direccion', isAdminLog, async (req, res) => {
    const new_direccion = {
        DIR_DESCRIPCION: req.body.DIR_DESCRIPCION,
        DIR_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO direcciones set ?", [new_direccion]);
    req.flash('success', 'Dirección guardada exitosamente');
    res.redirect('/adminContactos');
});
router.post('/edit_direccion', isAdminLog, async (req, res) => {
    const edit_direccion = {
        DIR_DESCRIPCION: req.body.DIR_DESCRIPCION
    }
    await db.query("UPDATE direcciones SET ? WHERE dir_id=?;", [edit_direccion, req.body.DIR_ID]);
    req.flash('success', 'Dirección editada exitosamente');
    res.redirect('/adminContactos');
});
router.post('/delete_direccion', isAdminLog, async (req, res) => {
    const edit_direccion = {
        DIR_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE direcciones SET ? WHERE dir_id=?;", [edit_direccion, req.body.DIR_ID]);
    req.flash('success', 'Dirección eliminada exitosamente');
    res.redirect('/adminContactos');
});
//----------------------CONTACTOS----------------------------

//----------------------ADMIN ANUNCIOS----------------------------
router.get('/adminAnuncios', isAdminLog, async (req, res) => {
    const anuncios = await db.query('SELECT *, DATE_FORMAT(ANUN_FECHA,"%Y-%m-%d") as FECHA FROM anuncios WHERE anun_estado!="ELIMINADO"');
    anuncios.forEach(async element => {
        element.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', element.ANUN_ID);
        element.IMAGES.forEach(function (i, idx, array) {
            i.POS = idx;
        });
        const aux = await db.query('SELECT count(anmsg_id) as msg FROM anuncios_mensajes WHERE anun_id=?', element.ANUN_ID);
        element.MENSAJES = aux[0].msg;
    });
    res.render('admin/adminAnuncios', { anuncios });
});
router.post('/bloquearAnuncioAdmin', isAdminLog, async (req, res) => {
    const update_anuncio = {
        ANUN_ESTADO: 'BLOQUEADO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    console.log(req.body);
    res.redirect('/adminAnuncios');
});
router.post('/eliminarAnuncioAdmin', isAdminLog, async (req, res) => {
    const update_anuncio = {
        ANUN_ESTADO: 'ELIMINADO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    res.redirect('/adminAnuncios');
});
router.post('/desbloquearAnuncioAdmin', isAdminLog, async (req, res) => {
    const update_anuncio = {
        ANUN_ESTADO: 'ACTIVO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    res.redirect('/adminAnuncios');
});
router.post('/recomendadoAnuncio', isAdminLog, async (req, res) => {
    const update_anuncio = {
        ANUN_TIPO: 'RECOMENDADO'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    res.redirect('/adminAnuncios');
});
router.post('/normalAnuncio', isAdminLog, async (req, res) => {
    const update_anuncio = {
        ANUN_TIPO: 'NORMAL'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    res.redirect('/adminAnuncios');
});
router.post('/principalAnuncio', isAdminLog, async (req, res) => {
    const update_anuncio = {
        ANUN_TIPO: 'PRINCIPAL'
    }
    await db.query('UPDATE anuncios SET ? WHERE anun_id=?', [update_anuncio, req.body.ANUN_ID]);
    res.redirect('/adminAnuncios');
});
//----------------------ADMIN ANUNCIOS----------------------------

//----------------------ADMIN USUARIOS----------------------------
router.get('/adminUsuarios', isAdminLog, async (req, res) => {
    var usuarios = await db.query("SELECT * FROM usuarios WHERE usu_estado!='ELIMINADO'");
    usuarios.forEach(async element => {
        var row = await db.query("SELECT count(usu_id) as n FROM anuncios WHERE usu_id=?", element.USU_ID);
        element.ANUNCIOS = row[0].n
    });
    res.render('admin/adminUsuarios', { usuarios });
});
router.get('/usuarioAnuncios/:USU_ID', isAdminLog, async (req, res) => {
    const { USU_ID } = req.params;
    const anuncios = await db.query('SELECT *, DATE_FORMAT(ANUN_FECHA,"%Y-%m-%d") as FECHA FROM anuncios WHERE anun_estado!="ELIMINADO" AND usu_id=?', USU_ID);
    anuncios.forEach(async element => {
        element.IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', element.ANUN_ID);
        element.IMAGES.forEach(function (i, idx, array) {
            i.POS = idx;
        });
        const aux = await db.query('SELECT count(anmsg_id) as msg FROM anuncios_mensajes WHERE anun_id=?', element.ANUN_ID);
        element.MENSAJES = aux[0].msg;
    });
    res.render('admin/adminAnuncios', { anuncios });
});
router.post('/blockUser', isAdminLog, async (req, res) => {
    const update_user = {
        USU_ESTADO: 'BLOQUEADO'
    }
    await db.query('UPDATE usuarios SET ? WHERE usu_id=?', [update_user, req.body.USU_ID]);
    res.redirect('/adminUsuarios');
});
router.post('/unlockUser', isAdminLog, async (req, res) => {
    const update_user = {
        USU_ESTADO: 'ACTIVO'
    }
    await db.query('UPDATE usuarios SET ? WHERE usu_id=?', [update_user, req.body.USU_ID]);
    res.redirect('/adminUsuarios');
});
//----------------------ADMIN USUARIOS----------------------------

//----------------------ADMIN MENSAJES----------------------------
router.get('/adminMensajes', isAdminLog, async (req, res) => {
    const mensajes = await db.query("SELECT *,DATE_FORMAT(USUMSG_FECHA,'%Y-%m-%d') as FECHA FROM usuarios_mensajes um, usuarios u, preguntas p WHERE u.usu_id=um.usu_id AND p.preg_id=um.preg_id AND um.usumsg_estado='ACTIVO' ");

    res.render('admin/adminMensajes', { mensajes });
});
router.post('/eliminarMensaje', isAdminLog, async (req, res) => {
    const update_mensaje = {
        USUMSG_ESTADO: 'ELIMINADO'
    }
    await db.query('UPDATE usuarios_mensajes SET ? WHERE usumsg_id=?', [update_mensaje, req.body.USUMSG_ID]);
    res.redirect('/adminMensajes');
});
//----------------------ADMIN MENSAJES----------------------------

//----------------------ADMIN CUENTA----------------------------
router.get('/adminCuenta', isAdminLog, async (req, res) => {
    res.render('admin/adminCuenta', {});
});
router.get('/editarAdminCuenta', isAdminLog, async (req, res) => {
    res.render('admin/adminEditarCuenta', {});
});
router.get('/editarAdminContrasena', isAdminLog, async (req, res) => {
    res.render('admin/adminEditarContrasena', {});
});
router.post('/editarAdminCuenta', isAdminLog, async (req, res) => {
    update_admin = {
        ADMIN_NOMBRE: req.body.ADMIN_NOMBRE,
        ADMIN_APELLIDO: req.body.ADMIN_APELLIDO,
        ADMIN_USUARIO: req.body.ADMIN_USUARIO
    }
    console.log(req.body);
    await db.query('UPDATE administrador SET ? WHERE admin_id=?', [update_admin, req.user.ADMIN_ID]);
    req.flash('success', 'Datos modificados correctamente');
    res.redirect('/adminCuenta');
});
router.post('/editarAdminContrasena', isAdminLog, async(req, res) => {
    if (helpers.comparar(req.body.ADMIN_CONTRASENA, req.user.ADMIN_CONTRASENA)) {
        if (req.body.ADMIN_CONTRASENA_NUEVA == req.body.ADMIN_CONTRASENA_NUEVA_C) {
            update_admin = {
                ADMIN_CONTRASENA: helpers.encriptar(req.body.ADMIN_CONTRASENA_NUEVA)
            }
            await db.query('UPDATE administrador SET ? WHERE admin_id=?', [update_admin, req.user.ADMIN_ID]);
            req.flash('success', 'Contraseña cambiada, Inicie sesión Nuevamente');
            res.redirect('/logout');
        } else {
            req.flash('fail', 'Las contraseñas nuevas no coinciden')
        }
    } else {
        req.flash('fail', 'Las contraseña actual es incorrecta')
    }
    res.redirect('/editarAdminContrasena');
});
//----------------------ADMIN CUENTA----------------------------



module.exports = router;