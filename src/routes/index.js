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
        if(aux.length==6){
            var pagina={
                NUM:num_pag,
                ANUNCIOS:aux
            }
            paginas.push(pagina);
            aux=[];
            num_pag++;
        }
    }
    if (aux.length < 6) {
        var pagina={
            NUM:num_pag,
            ANUNCIOS:aux
        }
        paginas.push(pagina);
    }

    /*
      for (let i in ecuador) {
        console.log(i,ecuador[i].provincia);
        const newProv={
            PROV_ID:i,
            PROV_NOMBRE:ecuador[i].provincia,
            PROV_ESTADO:"ACTIVO"
        }
        //await db.query("INSERT INTO provincias SET ?",[newProv]);
        for (let j in ecuador[i].cantones) {
            console.log("      ",j, ecuador[i].cantones[j].canton );
            const newCant={
                CANT_ID:j,
                PROV_ID:i,
                CANT_NOMBRE:ecuador[i].cantones[j].canton,
                CANT_ESTADO:"ACTIVO"
            }
            //await db.query("INSERT INTO cantones SET ?",[newCant]);

            for (let k in ecuador[i].cantones[j].parroquias) {
                console.log("      ","       ", k, ecuador[i].cantones[j].parroquias[k]);
                const newZon={
                    ZON_ID:k,
                    CANT_ID:j,
                    ZON_NOMBRE:ecuador[i].cantones[j].parroquias[k],
                    ZON_ESTADO:"ACTIVO"
                }
                await db.query("INSERT INTO zonas SET ?",[newZon]);
                
            }
        }
      }
      
*/

    res.render('public/inicio', { tipos_inmuebles, paginas});
});

router.get('/allProyects', async (req, res) => {
    var anuncios_principales = await db.query("SELECT *, DATE_FORMAT(ANUN_FECHA,'%Y-%m-%d') as FECHA FROM anuncios WHERE anun_estado='ACTIVO' AND anun_tipo='PRINCIPAL';");

    for(var i=0;i<anuncios_principales.length;i++){
        anuncios_principales[i].IMAGES = await db.query('SELECT * FROM imagenes WHERE anun_id=?', anuncios_principales[i].ANUN_ID);
        for(var j=0;j<anuncios_principales[i].IMAGES.length;j++){
            anuncios_principales[i].IMAGES[j].POS=j;
        }
    }
    res.render('public/allProyects', { anuncios_principales});
});





module.exports = router;