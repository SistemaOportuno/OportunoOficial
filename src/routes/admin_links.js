const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/adminPanel', (req, res) => {
    res.render('admin/adminPanel');
});
router.get('/componentes', (req, res) => {
    res.render('admin/componentes');
});

//----------------------TIPOS INMUEBLES----------------------------
router.get('/tiposInmuebles', async (req, res) => {
    const tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO';")
    res.render('admin/tiposInmuebles', { tipos_inmuebles });
});

router.post('/add_tipo_inmueble', async (req, res) => {
    const new_tipo_inmueble = {
        TIPINM_DESCRIPCION: req.body.TIPINM_DESCRIPCION,
        TIPINM_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO tipos_inmuebles set ?", [new_tipo_inmueble]);
    req.flash('success', 'Tipo de Inmueble guardado exitosamente');
    res.redirect('/tiposInmuebles');
});
router.post('/edit_tipo_inmueble', async (req, res) => {
    const edit_tipo_inmueble = {
        TIPINM_DESCRIPCION: req.body.TIPINM_DESCRIPCION
    }
    await db.query("UPDATE tipos_inmuebles SET ? WHERE tipinm_id=?;", [edit_tipo_inmueble, req.body.TIPINM_ID]);
    req.flash('success', 'Tipo de Inmueble editado exitosamente');
    res.redirect('/tiposInmuebles');
});
router.post('/delete_tipo_inmueble', async (req, res) => {
    const edit_tipo_inmueble = {
        TIPINM_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE tipos_inmuebles SET ? WHERE tipinm_id=?;", [edit_tipo_inmueble, req.body.TIPINM_ID]);
    req.flash('success', 'Tipo de Inmueble eliminado exitosamente');
    res.redirect('/tiposInmuebles');
});
//----------------------TIPOS INMUEBLES----------------------------
//----------------------GRUPO CARACTERISTICAS----------------------------
router.get('/grupoCaracteristicas', async (req, res) => {
    const grupo_caracteristicas = await db.query("SELECT * FROM grupos_caracteristicas WHERE grup_estado='ACTIVO';")
    grupo_caracteristicas.forEach(async (element) => {
        element.caracteristicas = await db.query("SELECT caract_descripcion FROM caracteristicas WHERE grup_id=? AND caract_estado='ACTIVO';", [element.GRUP_ID]);
    });
    res.render('admin/grupoCaracteristicas', { grupo_caracteristicas });
});
router.post('/add_grupo_caracteristicas', async (req, res) => {
    const new_grupo_caracteristicas = {
        GRUP_DESCRIPCION: req.body.GRUP_DESCRIPCION,
        GRUP_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO grupos_caracteristicas SET ?", [new_grupo_caracteristicas]);
    req.flash('success', 'Grupo de Características guardado exitosamente');
    res.redirect('/grupoCaracteristicas');
});
router.post('/edit_grupo_caracteristicas', async (req, res) => {
    const edit_grupo_caracteristicas = {
        GRUP_DESCRIPCION: req.body.GRUP_DESCRIPCION
    }
    await db.query("UPDATE grupos_caracteristicas SET ? WHERE grup_id=?;", [edit_grupo_caracteristicas, req.body.GRUP_ID]);
    req.flash('success', 'Grupo de características editado exitosamente');
    res.redirect('/grupoCaracteristicas');
});
router.post('/delete_grupo_caracteristicas', async (req, res) => {
    const edit_grupo_caracteristicas = {
        GRUP_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE grupos_caracteristicas SET ? WHERE grup_id=?;", [edit_grupo_caracteristicas, req.body.GRUP_ID]);
    req.flash('success', 'Grupo de Características eliminado exitosamente');
    res.redirect('/grupoCaracteristicas');
});
//----------------------GRUPO CARACTERITICAS----------------------------
//----------------------CARACTERISTICAS----------------------------
router.get('/caracteristicas/:GRUP_ID', async (req, res) => {
    const { GRUP_ID } = req.params;
    const row = await db.query("SELECT * FROM grupos_caracteristicas WHERE grup_id=? AND grup_estado='ACTIVO';", [GRUP_ID])
    const caracteristicas = await db.query("SELECT * FROM caracteristicas WHERE  grup_id=? AND caract_estado='ACTIVO';", [GRUP_ID])
    const grupo = row[0];
    res.render('admin/caracteristicas', { caracteristicas, grupo });
});
router.post('/add_caracteristica', async (req, res) => {
    const new_caracteristica = {
        GRUP_ID: req.body.GRUP_ID,
        CARACT_DESCRIPCION: req.body.CARACT_DESCRIPCION,
        CARACT_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO caracteristicas SET ?", [new_caracteristica]);
    req.flash('success', 'Característica guardada exitosamente');
    res.redirect('/caracteristicas/' + req.body.GRUP_ID);
});
router.post('/edit_caracteristica', async (req, res) => {
    const edit_caracteristica = {
        CARACT_DESCRIPCION: req.body.CARACT_DESCRIPCION
    }
    await db.query("UPDATE caracteristicas SET ? WHERE caract_id=?;", [edit_caracteristica, req.body.CARACT_ID]);
    req.flash('success', 'Característica editada exitosamente');
    res.redirect('/caracteristicas/' + req.body.GRUP_ID);
});
router.post('/delete_caracteristica', async (req, res) => {
    const edit_caracteristica = {
        CARACT_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE caracteristicas SET ? WHERE caract_id=?;", [edit_caracteristica, req.body.CARACT_ID]);
    req.flash('success', 'Característica eliminada exitosamente');
    res.redirect('/caracteristicas/' + req.body.GRUP_ID);
});
//----------------------CARACTERISTICAS----------------------------
//----------------------PROVINCIAS----------------------------
router.get('/provincias', async (req, res) => {
    const provincias = await db.query("SELECT * FROM provincias WHERE prov_estado='ACTIVO';")
    res.render('admin/provincias', { provincias });
});
router.post('/add_provincia', async (req, res) => {
    const new_provincia = {
        PROV_NOMBRE: req.body.PROV_NOMBRE,
        PROV_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO provincias SET ?", [new_provincia]);
    req.flash('success', 'Provincia guardada exitosamente');
    res.redirect('/provincias');
});
router.post('/edit_provincia', async (req, res) => {
    const edit_provincia = {
        PROV_NOMBRE: req.body.PROV_NOMBRE
    }
    await db.query("UPDATE provincias SET ? WHERE prov_id=?;", [edit_provincia, req.body.PROV_ID]);
    req.flash('success', 'Provincia editada exitosamente');
    res.redirect('/provincias');
});
router.post('/delete_provincia', async (req, res) => {
    const edit_provincia = {
        PROV_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE provincias SET ? WHERE prov_id=?;", [edit_provincia, req.body.PROV_ID]);
    req.flash('success', 'Provincia eliminada exitosamente');
    res.redirect('/provincias');
});
//----------------------PROVINCIAS----------------------------
//----------------------CANTONES----------------------------
router.get('/cantones/:PROV_ID', async (req, res) => {
    const { PROV_ID } = req.params;
    const row = await db.query("SELECT * FROM provincias WHERE prov_id=? AND prov_estado='ACTIVO';", [PROV_ID])
    const cantones = await db.query("SELECT * FROM cantones WHERE  prov_id=? AND cant_estado='ACTIVO';", [PROV_ID])
    const provincia = row[0];
    res.render('admin/cantones', { cantones, provincia });
});
router.post('/add_canton', async (req, res) => {
    const new_canton = {
        PROV_ID: req.body.PROV_ID,
        CANT_NOMBRE: req.body.CANT_NOMBRE,
        CANT_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO cantones SET ?", [new_canton]);
    req.flash('success', 'Cantón guardado exitosamente');
    res.redirect('/cantones/' + req.body.PROV_ID);
});
router.post('/edit_canton', async (req, res) => {
    const edit_canton = {
        CANT_NOMBRE: req.body.CANT_NOMBRE
    }
    await db.query("UPDATE cantones SET ? WHERE cant_id=?;", [edit_canton, req.body.CANT_ID]);
    req.flash('success', 'Cantón editado exitosamente');
    res.redirect('/cantones/' + req.body.PROV_ID);
});
router.post('/delete_canton', async (req, res) => {
    const edit_canton = {
        CANT_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE cantones SET ? WHERE cant_id=?;", [edit_canton, req.body.CANT_ID]);
    req.flash('success', 'Cantón eliminado exitosamente');
    res.redirect('/cantones/' + req.body.PROV_ID);
});
//----------------------CANTONES----------------------------
//----------------------ZONAS----------------------------

router.get('/zonas/:CANT_ID', async (req, res) => {
    const { CANT_ID } = req.params;
    const row = await db.query("SELECT * FROM cantones WHERE cant_id=? AND cant_estado='ACTIVO';", [CANT_ID])
    const zonas = await db.query("SELECT * FROM zonas WHERE  cant_id=? AND zon_estado='ACTIVO';", [CANT_ID])
    const canton = row[0];
    res.render('admin/zonas', { canton, zonas });
});
router.post('/add_zona', async (req, res) => {
    const new_zona = {
        CANT_ID: req.body.CANT_ID,
        ZON_NOMBRE: req.body.ZON_NOMBRE,
        ZON_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO zonas SET ?", [new_zona]);
    req.flash('success', 'Zona guardada exitosamente');
    res.redirect('/zonas/' + req.body.CANT_ID);
});
router.post('/edit_zona', async (req, res) => {
    const edit_zona = {
        ZON_NOMBRE: req.body.ZON_NOMBRE
    }
    await db.query("UPDATE zonas SET ? WHERE zon_id=?;", [edit_zona, req.body.ZON_ID]);
    req.flash('success', 'Zona editada exitosamente');
    res.redirect('/zonas/' + req.body.CANT_ID);
});
router.post('/delete_zona', async (req, res) => {
    const edit_zona = {
        ZON_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE zonas SET ? WHERE zon_id=?;", [edit_zona, req.body.ZON_ID]);
    req.flash('success', 'Zona eliminada exitosamente');
    res.redirect('/zonas/' + req.body.CANT_ID);
});
//----------------------ZONAS----------------------------
//----------------------PREGUNTAS----------------------------
router.get('/preguntas', async (req, res) => {
    const preguntas = await db.query("SELECT * FROM preguntas WHERE preg_estado='ACTIVO';")
    res.render('admin/Preguntas', { preguntas });
});
router.post('/add_pregunta', async (req, res) => {
    const new_pregunta = {
        PREG_DESCRIPCION: req.body.PREG_DESCRIPCION,
        PREG_ESTADO: "ACTIVO"
    }
    await db.query("INSERT INTO preguntas SET ?", [new_pregunta]);
    req.flash('success', 'Pregunta guardada exitosamente');
    res.redirect('/preguntas');
});
router.post('/edit_pregunta', async (req, res) => {
    const edit_pregunta = {
        PREG_DESCRIPCION: req.body.PREG_DESCRIPCION
    }
    await db.query("UPDATE preguntas SET ? WHERE preg_id=?;", [edit_pregunta, req.body.PREG_ID]);
    req.flash('success', 'Pregunta editada exitosamente');
    res.redirect('/preguntas');
});
router.post('/delete_pregunta', async (req, res) => {
    const edit_pregunta = {
        PREG_ESTADO: "ELIMINADO"
    }
    await db.query("UPDATE preguntas SET ? WHERE preg_id=?;", [edit_pregunta, req.body.PREG_ID]);
    req.flash('success', 'Pregunta eliminada exitosamente');
    res.redirect('/preguntas');
});
//----------------------PREGUNTAS----------------------------

router.get('/adminAnuncios', (req, res) => {
    res.render('admin/adminAnuncios');
});
router.get('/adminUsuarios', (req, res) => {
    res.render('admin/adminUsuarios');
});
router.get('/usuarioAnuncios', (req, res) => {
    res.render('admin/usuarioAnuncios');
});
router.get('/adminMensajes', (req, res) => {
    res.render('admin/adminMensajes');
});



module.exports = router;