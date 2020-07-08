var searchInput = 'search_input';
$(document).ready(function () {
  var autocomplete;
  var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name',
    administrative_area_level_2:'short_name',
    sublocality_level_1:'short_name',
    sublocality:'short_name'
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
      console.log(near_place.address_components[i]);
      if (componentForm[addressType]) {
        var val = near_place.address_components[i][componentForm[addressType]];
        document.getElementById(addressType).value = val;
      }
    }

  });
});

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
});
/*MAPS */
var map;
function initialize() {
  var mapOptions = {
    zoom: 10,
    center: { lat: -0.317176, lng: -78.445544 }
  };
  map = new google.maps.Map(document.getElementById('map-anuncio'),
    mapOptions);

  var marker = new google.maps.Marker({
    position: { lat: -0.317176, lng: -78.445544 },
    map: map
  });
  var infowindow = new google.maps.InfoWindow({
    content: '<p>Marker Location:' + marker.getPosition() + '</p>'
  });
  google.maps.event.addListener(marker, 'click', function () {
    infowindow.open(map, marker);
  });
}
google.maps.event.addDomListener(window, 'load', initialize);
//select
