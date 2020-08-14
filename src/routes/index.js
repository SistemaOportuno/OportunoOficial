const express = require('express');
const router = express.Router();
const db = require('../database');


router.get('/', async (req, res) => {
    var tipos_inmuebles = await db.query("SELECT * FROM tipos_inmuebles WHERE tipinm_estado='ACTIVO';");
    var anuncios_principales = await db.query("SELECT *, DATE_FORMAT(ANUN_FECHA,'%Y-%m-%d') as FECHA FROM anuncios WHERE anun_estado='ACTIVO' AND anun_tipo='PRINCIPAL';");

    var num_pag=0;
    var aux = [];
    const paginas=[];

    for(var i=0;i<anuncios_principales.length;i++){
        anuncios_principales[i].IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', anuncios_principales[i].ANUN_ID);
        for(var j=0;j<anuncios_principales[i].IMAGES.length;j++){
            anuncios_principales[i].IMAGES[j].POS=j;
        }
        aux.push(anuncios_principales[i]);
        if(aux.length==4){
            var pagina={
                NUM:num_pag,
                ANUNCIOS:aux
            }
            paginas.push(pagina);
            aux=[];
            num_pag++;
        }
    }
    if (aux.length < 4) {
        var pagina={
            NUM:num_pag,
            ANUNCIOS:aux
        }
        paginas.push(pagina);
    }


    res.render('public/inicio', { tipos_inmuebles, paginas});
});


module.exports = router;