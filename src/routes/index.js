const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        var tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO';");
        var anuncios_principales = await db.query("SELECT *, DATE_FORMAT(ANUN_FECHA,'%Y-%m-%d') as FECHA FROM anuncios WHERE anun_estado='ACTIVO' AND anun_tipo='PRINCIPAL';");
        var num_anun = 0;
        var num_pag = 0;
        var aux = [];
        const paginas = [];

        for (var i = 0; i < anuncios_principales.length; i++) {
            anuncios_principales[i].IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', anuncios_principales[i].ANUN_ID);
            for (var j = 0; j < anuncios_principales[i].IMAGES.length; j++) {
                anuncios_principales[i].IMAGES[j].POS = j;
            }
            anuncios_principales[i].NUM = num_anun;
            num_anun++;
            aux.push(anuncios_principales[i]);
            if (aux.length == 6) {
                var pagina = {
                    NUM: num_pag,
                    ANUNCIOS: aux
                };
                paginas.push(pagina);
                aux = [];
                num_pag++;
                num_anun = 0;
            }
        }
        if (aux.length < 6) {
            var pagina = {
                NUM: num_pag,
                ANUNCIOS: aux
            };
            paginas.push(pagina);
        }

        const principal = true;
        res.render('public/inicio', { tipos_inmuebles, paginas, principal });
    } catch (error) {
        console.error('Error en la ruta /:', error.message);
        // Renderizar la página con datos vacíos para evitar que la aplicación crashee
        res.render('public/inicio', {
            tipos_inmuebles: [],
            paginas: [],
            principal: true,
            error: 'No se pudo conectar a la base de datos'
        });
    }
});

module.exports = router;