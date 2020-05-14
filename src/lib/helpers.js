const md5=require('md5');
const helpers={};

helpers.encriptar=(contrasena)=>{
    return md5(contrasena);
};
helpers.comparar=(contrasena, contrasenag)=>{
    if(md5(contrasena)===contrasenag){
        return true;
    }else{
        return false;
    }
};
helpers.encriptar=(contrasena)=>{
    return md5(contrasena);
};
helpers.parseDate=(date)=>{
    if(date!="0000-00-00"){
        var dd = date.getDate();
        var mm = date.getMonth()+1;
        var yyyy = date.getFullYear();
        if(dd<10) {
            dd='0'+dd
        } 
        if(mm<10) {
            mm='0'+mm
        } 
        var fe = new Date();
        fe= yyyy+'-'+mm+'-'+dd;
        return fe;
    }else{
        return null;
    }
};


module.exports=helpers;