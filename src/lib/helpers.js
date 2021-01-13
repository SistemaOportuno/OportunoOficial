const md5 = require('md5');
const helpers = {};

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "oportuno.ec@gmail.com",
        pass: "Ligobas1"
    }
});


helpers.enviarCOrreo = (mailOptions) => {
    transporter.sendMail(mailOptions, function (error, info) {
        console.log(mailOptions)
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

helpers.encriptar = (contrasena) => {
    return md5(contrasena);
};
helpers.comparar = (contrasena, contrasenag) => {
    if (md5(contrasena) === contrasenag) {
        return true;
    } else {
        return false;
    }
};
helpers.parseDate = (date) => {
    if (date != "0000-00-00") {
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        var fe = new Date();
        fe = yyyy + '-' + mm + '-' + dd;
        return fe;
    } else {
        return null;
    }
};
helpers.fecha_actual = () => {
    var hoy = new Date();
    var dd = hoy.getDate();
    var mm = hoy.getMonth() + 1; //hoy es 0!
    var yyyy = hoy.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }
    hoy = yyyy + '/' + mm + '/' + dd;
    return hoy;
}

helpers.randomString = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

helpers.getUrl = () => {
    return "http://www.oportuno.net";
}

module.exports = helpers;