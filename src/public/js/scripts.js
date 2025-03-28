// Llamada inicial para inicializar los mapas
document.addEventListener('DOMContentLoaded', function () {
    // Llama a las funciones de inicialización según la página
    if (document.getElementById('map-registro')) {
        if (document.getElementById('anuncio_latitud') && document.getElementById('anuncio_longitud')) {
            init_map_edit();
        } else {
            init_map_registro();
        }
    }
    if (document.getElementById('map-anuncio')) {
        init_map_anuncio();
    }
});

function deleteImg(IMG_ID) {
    document.getElementById("card" + IMG_ID).remove();
    let IMG_NOMBRE = document.getElementById(IMG_ID).value;

    fetch(`/deleteImage/${IMG_ID}/${IMG_NOMBRE}`)
        .catch(err => console.error("Error eliminando la imagen:", err));
}

// Función para geocodificar usando OpenCage
async function geocodeWithOpenCage(address) {
    const apiKey = 'b3450320abe14011ae6f1fa880e06156'; // Tu clave de API de OpenCage
    const apiUrl = 'https://api.opencagedata.com/geocode/v1/json';
    const requestUrl = `${apiUrl}?q=${encodeURIComponent(address)}&key=${apiKey}&pretty=1&no_annotations=1&countrycode=ec`; // Restringir a Ecuador

    try {
        const response = await fetch(requestUrl);
        const data = await response.json();

        if (data.status.code === 200 && data.results.length > 0) {
            const geometry = data.results[0].geometry;
            const components = data.results[0].components || {}; // Obtener los componentes
            return {
                status: "OK",
                results: [{
                    geometry: {
                        location: {
                            lat: geometry.lat,
                            lng: geometry.lng
                        }
                    },
                    components: components // Incluir los componentes en la respuesta
                }]
            };
        } else {
            throw new Error(`Error al geocodificar: ${data.status.message}`);
        }
    } catch (error) {
        throw error;
    }
}

async function select_zona() {
    let select_zona = document.getElementById('anuncio_zona');
    let nombre_zona = select_zona.options[select_zona.selectedIndex].text;

    let select_canton = document.getElementById('anuncio_canton');
    let nombre_canton = select_canton.options[select_canton.selectedIndex].text;

    let select_provincia = document.getElementById('anuncio_provincia');
    let nombre_provincia = select_provincia.options[select_provincia.selectedIndex].text;

    try {
        const results = await geocodeWithOpenCage(`Ecuador, ${nombre_provincia}, ${nombre_canton}, ${nombre_zona}`);

        if (results.status === "OK" && results.results.length > 0) {
            map_registro.setView([results.results[0].geometry.location.lat, results.results[0].geometry.location.lng], 15);
        } else {
            alert("No se pudo encontrar la ubicación. Por favor, verifica los datos ingresados.");
        }
    } catch (error) {
        console.error("Error al obtener la ubicación:", error);
        alert("Error al obtener la ubicación: " + error.message);
    }
}

async function select_canton() {
    let select_canton = document.getElementById('anuncio_canton');
    let id_canton = select_canton.value;
    let nombre_canton = select_canton.options[select_canton.selectedIndex].text;

    let select_provincia = document.getElementById('anuncio_provincia');
    let nombre_provincia = select_provincia.options[select_provincia.selectedIndex].text;

    try {
        const results = await geocodeWithOpenCage(`Ecuador, ${nombre_provincia}, ${nombre_canton}`);

        if (results.status === "OK" && results.results.length > 0) {
            map_registro.setView([results.results[0].geometry.location.lat, results.results[0].geometry.location.lng], 13);
        } else {
            alert("No se pudo encontrar la ubicación. Por favor, verifica los datos ingresados.");
        }
    } catch (error) {
        console.error("Error al obtener la ubicación:", error);
        alert("Error al obtener la ubicación: " + error.message);
    }

    let select_zona = document.getElementById('anuncio_zona');
    select_zona.innerHTML = '<option value="">Seleccione la Zona</option>';

    try {
        let response = await fetch(`/getZonas/${id_canton}`);
        let zonas = await response.json();

        zonas.forEach(element => {
            let opt = document.createElement('option');
            opt.textContent = element.ZON_NOMBRE;
            opt.value = element.ZON_ID;
            select_zona.appendChild(opt);
        });
    } catch (error) {
        console.error("Error al cargar las zonas:", error);
    }
}

async function select_provincia() {
    let select_provincia = document.getElementById('anuncio_provincia');
    let id_provincia = select_provincia.value;
    let nombre_provincia = select_provincia.options[select_provincia.selectedIndex].text;

    try {
        const results = await geocodeWithOpenCage(`Ecuador, ${nombre_provincia}`);

        if (results.status === "OK" && results.results.length > 0) {
            map_registro.setView([results.results[0].geometry.location.lat, results.results[0].geometry.location.lng], 10);
        } else {
            alert("No se pudo encontrar la ubicación. Por favor, verifica los datos ingresados.");
        }
    } catch (error) {
        console.error("Error al obtener la ubicación:", error);
        alert("Error al obtener la ubicación: " + error.message);
    }

    let select_canton = document.getElementById('anuncio_canton');
    select_canton.innerHTML = '<option value="">Seleccione el Cantón</option>';

    try {
        let response = await fetch(`/getCantones/${id_provincia}`);
        let cantones = await response.json();

        cantones.forEach(element => {
            let opt = document.createElement('option');
            opt.textContent = element.CANT_NOMBRE;
            opt.value = element.CANT_ID;
            select_canton.appendChild(opt);
        });
    } catch (error) {
        console.error("Error al cargar los cantones:", error);
    }
}

// Funciones de cambio de filtros
function chTransaccion() { document.getElementById('formlist').submit(); }
function chProvincia(check) { updateFilter(check, 'id_provincia'); }
function chCanton(check) { updateFilter(check, 'id_canton'); }
function chZona(check) { updateFilter(check, 'id_zona'); }
function chTipo(check) { updateFilter(check, 'id_tipo'); }
function chCosto() { document.getElementById('formlist').submit(); }
function chArea() { document.getElementById('formlist').submit(); }

function updateFilter(check, fieldId) {
    document.getElementById(fieldId).value = check.value;
    check.checked = false;
    document.getElementById('formlist').submit();
}

// Inicialización de DataTables y Autocompletado
let autocomplete;
$(document).ready(function () {
    $('.datatable').DataTable({
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        language: {
            lengthMenu: "Mostrando _MENU_ elementos",
            zeroRecords: "Ningún registro",
            info: "Página _PAGE_ de _PAGES_",
            infoEmpty: "No existen registros",
            infoFiltered: "(filtrados de _MAX_ registros)",
            search: "Buscar:",
            paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" }
        },
        order: []
    });

    // Inicializar el autocompletado
    init_search_input();
});

// Función para inicializar el autocompletado en Inicio.hbs
function init_search_input() {
    const input = document.getElementById('search_input');
    if (input) {
        // Reemplazamos el autocompletado de Google Places por una solución con OpenCage
        input.addEventListener('input', async function () {
            const query = input.value;
            if (query.length < 3) return; // Esperar a que el usuario escriba al menos 3 caracteres

            try {
                const apiKey = 'b3450320abe14011ae6f1fa880e06156';
                const apiUrl = 'https://api.opencagedata.com/geocode/v1/json';
                const requestUrl = `${apiUrl}?q=${encodeURIComponent(query)}&key=${apiKey}&pretty=1&no_annotations=1&countrycode=ec&limit=5`;

                const response = await fetch(requestUrl);
                const data = await response.json();

                // Crear un datalist para mostrar las sugerencias
                let datalist = document.getElementById('suggestions');
                if (!datalist) {
                    datalist = document.createElement('datalist');
                    datalist.id = 'suggestions';
                    document.body.appendChild(datalist);
                    input.setAttribute('list', 'suggestions');
                }
                datalist.innerHTML = '';

                if (data.results && data.results.length > 0) {
                    data.results.forEach(result => {
                        const option = document.createElement('option');
                        option.value = result.formatted;
                        datalist.appendChild(option);
                    });
                }
            } catch (error) {
                console.error("Error al obtener sugerencias:", error);
            }
        });

        input.addEventListener('change', async function () {
            const address = input.value;
            try {
                const results = await geocodeWithOpenCage(address);
                console.log("Respuesta de geocodeWithOpenCage:", results); // Depurar la respuesta
                if (results.status === "OK" && results.results.length > 0) {
                    const components = results.results[0].components || {};
                    console.log("Componentes:", components); // Depurar los componentes
                    let street_number = components.house_number || "";
                    let route = components.road || "";
                    let locality = components.city || components.town || components.village || "";
                    let administrative_area_level_1 = components.state || "";
                    let country = components.country || "";

                    document.getElementById('street_number').value = street_number;
                    document.getElementById('route').value = route;
                    document.getElementById('locality').value = locality;
                    document.getElementById('administrative_area_level_1').value = administrative_area_level_1;
                    document.getElementById('country').value = country;
                } else {
                    alert("Por favor, selecciona una dirección válida de la lista.");
                }
            } catch (error) {
                console.error("Error al geocodificar la dirección seleccionada:", error);
                alert("Error al geocodificar la dirección: " + error.message);
            }
        });
    }
}

// Funciones de mapas
let map_registro, map_anuncio;

function init_map_registro() {
    map_registro = L.map('map-registro').setView([-1.831239, -78.183406], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map_registro);

    let marker = null;
    map_registro.on('click', function (e) {
        if (marker) {
            map_registro.removeLayer(marker);
        }
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map_registro);
        // Actualizar los campos de latitud y longitud
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        document.getElementById('anuncio_latitud').value = lat;
        document.getElementById('anuncio_longitud').value = lng;
        // Depurar los valores
        console.log("Coordenadas seleccionadas - Latitud:", lat, "Longitud:", lng);
    });
}

function init_map_edit() {
    let lat = parseFloat(document.getElementById('anuncio_latitud').value) || -1.831239;
    let lon = parseFloat(document.getElementById('anuncio_longitud').value) || -78.183406;

    map_registro = L.map('map-registro').setView([lat, lon], lat === -1.831239 ? 7 : 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map_registro);

    let marker = L.marker([lat, lon]).addTo(map_registro);

    map_registro.on('click', function (e) {
        if (marker) {
            map_registro.removeLayer(marker);
        }
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map_registro);
        document.getElementById('anuncio_latitud').value = e.latlng.lat;
        document.getElementById('anuncio_longitud').value = e.latlng.lng;
    });
}

function init_map_anuncio() {
    let lat = parseFloat(document.getElementById('lat').value) || -1.831239;
    let lon = parseFloat(document.getElementById('lon').value) || -78.183406;

    // Depurar los valores de lat y lon
    console.log("Latitud:", lat, "Longitud:", lon);

    map_anuncio = L.map('map-anuncio').setView([lat, lon], lat === -1.831239 ? 7 : 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map_anuncio);

    L.marker([lat, lon]).addTo(map_anuncio);
}

function goBack() { window.history.back(); }