function deleteImg(IMG_ID) {
    $("#card" + IMG_ID).remove()
    IMG_NOMBRE=document.getElementById(IMG_ID).value;
    $.ajax({
        url: '/deleteImage/' + IMG_ID + '/' + IMG_NOMBRE,
        success: function (result) {
        },
        error: function (err) {
            console.log(err);
        }
    });

}
function select_zona(){
    var select_zona = document.getElementById('anuncio_zona');
    var nombre_zona = select_zona.options[select_zona.selectedIndex].text;

    var select_canton = document.getElementById('anuncio_canton');
    var nombre_canton = select_canton.options[select_canton.selectedIndex].text;
    
    var select_provincia = document.getElementById('anuncio_provincia')
    var nombre_provincia = select_provincia.options[select_provincia.selectedIndex].text;
    geocoder.geocode({ 'address': "Ecuador, " + nombre_provincia + ", " + nombre_canton + ", " + nombre_zona }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map_registro.setCenter(results[0].geometry.location);
            map_registro.setZoom(15);
        }
    });
}
function select_canton() {
    var select_canton = document.getElementById('anuncio_canton');
    var id_canton = select_canton.value;
    var nombre_canton = select_canton.options[select_canton.selectedIndex].text;

    var select_provincia = document.getElementById('anuncio_provincia')
    var nombre_provincia = select_provincia.options[select_provincia.selectedIndex].text;

    geocoder.geocode({ 'address': "Ecuador, " + nombre_provincia + ", " + nombre_canton }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map_registro.setCenter(results[0].geometry.location);
            map_registro.setZoom(13);
        }
    });
    $('#anuncio_zona')
        .find('option')
        .remove()
        .end()
        .append('<option value="">Seleccione la Zona</option>')
        ;
    $.ajax({
        url: '/getZonas/' + id_canton,
        success: function (result) {
            var sel_zona = document.getElementById('anuncio_zona');
            result.forEach(element => {
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(element.ZON_NOMBRE));
                opt.value = element.ZON_ID;
                sel_zona.appendChild(opt);
            });
        },
        error: function (err) {
            console.log(err);
        }
    });
}
function select_provincia() {
    var select_provincia = document.getElementById('anuncio_provincia')
    var id_provincia = select_provincia.value;
    var nombre_provincia = select_provincia.options[select_provincia.selectedIndex].text;
    geocoder.geocode({ 'address': "Ecuador, " + nombre_provincia }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map_registro.setCenter(results[0].geometry.location);
            map_registro.setZoom(10);
        }
    });
    $('#anuncio_canton')
        .find('option')
        .remove()
        .end()
        .append('<option value="">Seleccione el Cantón</option>')
        ;
    $.ajax({
        url: '/getCantones/' + id_provincia,
        success: function (result) {
            var sel_canton = document.getElementById('anuncio_canton');
            result.forEach(element => {
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(element.CANT_NOMBRE));
                opt.value = element.CANT_ID;
                sel_canton.appendChild(opt);
            });
        },
        error: function (err) {
            console.log(err);
        }
    });
}
function chTransaccion() {
    document.getElementById('formlist').submit();
}
function chProvincia(check) {
    document.getElementById('id_provincia').value = check.value;
    check.checked = false;
    document.getElementById('formlist').submit();
}
function chCanton(check) {
    document.getElementById('id_canton').value = check.value;
    check.checked = false;
    document.getElementById('formlist').submit();
}
function chZona(check) {
    document.getElementById('id_zona').value = check.value;
    check.checked = false;
    document.getElementById('formlist').submit();
}
function chTipo(check) {
    document.getElementById('id_tipo').value = check.value;
    check.checked = false;
    document.getElementById('formlist').submit();
}
function chCosto() {
    document.getElementById('formlist').submit();
}
function chArea() {
    document.getElementById('formlist').submit();
}
function init_search_input() {
    var searchInput = 'search_input';
    var autocomplete;
    var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name',
        administrative_area_level_2: 'short_name',
        sublocality_level_1: 'short_name',
        sublocality: 'short_name'
    };
    autocomplete = new google.maps.places.Autocomplete((document.getElementById(searchInput)), {
        types: ['geocode'],
        componentRestrictions: {
            country: "EC"
        }
    });
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var near_place = autocomplete.getPlace();
        document.getElementById('latitude').value = near_place.geometry.location.lat();
        document.getElementById('longitude').value = near_place.geometry.location.lng();
        for (var i = 0; i < near_place.address_components.length; i++) {
            var addressType = near_place.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = near_place.address_components[i][componentForm[addressType]];
                document.getElementById(addressType).value = val;
            }
        }

    });
}

$(document).ready(function () {
    $('#example').DataTable({
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        language: {
            "lengthMenu": "Mostrando   _MENU_   elementos",
            "zeroRecords": "Ningun registro",
            "info": "Página _PAGE_ de _PAGES_",
            "infoEmpty": "No existen registros",
            "infoFiltered": "(filtered from _MAX_ total records)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
        },
    });
    $('#table_list').DataTable({
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        language: {
            "lengthMenu": "Mostrando   _MENU_   elementos",
            "zeroRecords": "Ningun registro",
            "info": "Página _PAGE_ de _PAGES_",
            "infoEmpty": "No existen registros",
            "infoFiltered": "(filtered from _MAX_ total records)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
        },
        order: []
    });




    $('#example2').DataTable({
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        language: {
            "lengthMenu": "Mostrando   _MENU_   elementos",
            "zeroRecords": "Ningun registro",
            "info": "Página _PAGE_ de _PAGES_",
            "infoEmpty": "No existen registros",
            "infoFiltered": "(filtered from _MAX_ total records)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
        },
    });
    $('#example3').DataTable({
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        language: {
            "lengthMenu": "Mostrando   _MENU_   elementos",
            "zeroRecords": "Ningun registro",
            "info": "Página _PAGE_ de _PAGES_",
            "infoEmpty": "No existen registros",
            "infoFiltered": "(filtered from _MAX_ total records)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
        },
    });
});
/*MAPS */
var map_registro;
var map_anuncio;
var geocoder;
function init_map_registro() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 7,
        center: { lat: -1.831239, lng: -78.183406 }
    };
    map_registro = new google.maps.Map(document.getElementById('map-registro'), mapOptions);
    map_registro.addListener("click", function (event) {
        addMarker(event.latLng);
    });
    var marker = null;
    function addMarker(location) {
        if (marker != null) {
            marker.setMap(null);
        }
        marker = new google.maps.Marker({
            position: location,
            map: map_registro
        });
        document.getElementById('anuncio_latitud').value = location.lat();
        document.getElementById('anuncio_longitud').value = location.lng();
    }
}
function init_map_edit() {
    geocoder = new google.maps.Geocoder();
    var lat = document.getElementById('anuncio_latitud').value;
    var lon = document.getElementById('anuncio_longitud').value;
    var mapOptions = {};
    var pos = {};
    if (lat == '') {
        pos = { lat: -1.831239, lng: -78.183406 };
        mapOptions = {
            zoom: 7,
            center: pos
        };
        map_registro = new google.maps.Map(document.getElementById('map-registro'), mapOptions);
    } else {
        pos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        mapOptions = {
            zoom: 15,
            center: pos
        };
        var marker_init = new google.maps.Marker({
            position: pos,
        });
        map_registro = new google.maps.Map(document.getElementById('map-registro'), mapOptions);
        marker_init.setMap(map_registro);
    }

    map_registro.addListener("click", function (event) {
        addMarker(event.latLng);
    });
    var marker = null;
    function addMarker(location) {
        if (marker != null) {
            marker.setMap(null);
        }
        if (marker_init != null) {
            marker_init.setMap(null);
            marker_init = null;
        }
        marker = new google.maps.Marker({
            position: location,
            map: map_registro
        });
        document.getElementById('anuncio_latitud').value = location.lat();
        document.getElementById('anuncio_longitud').value = location.lng();
    }
}
function init_map_anuncio() {
    var lat = document.getElementById('lat').value;
    var lon = document.getElementById('lon').value;
    var mapOptions = {};
    var pos = {};
    if (lat == '') {
        pos = { lat: -1.831239, lng: -78.183406 };
        mapOptions = {
            zoom: 7,
            center: pos
        };
        map_anuncio = new google.maps.Map(document.getElementById('map-anuncio'), mapOptions);
    } else {
        pos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        mapOptions = {
            zoom: 15,
            center: pos
        };
        var marker = new google.maps.Marker({
            position: pos,
        });
        map_anuncio = new google.maps.Map(document.getElementById('map-anuncio'), mapOptions);
        marker.setMap(map_anuncio);
    }
}

function goBack() {
    window.history.back();
}