import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const historial = document.querySelector('.lista-historial');

    // Limpiar las alertas
    let alertas = document.querySelector('.alertas');

    if(alertas) {
        limpiarAlertas();
    }

    if(historial) {
        historial.addEventListener('click', agregarHistorial);

        // Una vez que estamos en editar, llamar la función
        condicionesSeleccionadas();
    }

    const publicacionesListado = document.querySelector
    ('.panel-administracion');

    if(publicacionesListado){
        publicacionesListado.addEventListener('click', accionesListado);
    }
})

const historial = new Set();
const agregarHistorial = e => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            // Quitarlo del set y de la clase
            historial.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            // Agregarlo al set y a la clase
            historial.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    } 
    const historialArray = [...historial]
    document.querySelector('#historial').value = historialArray;
}

const condicionesSeleccionadas = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-historial .activo'));

    seleccionadas.forEach(seleccionada => {
        historial.add(seleccionada.textContent);
    })

    // Inyectarlo en el hidden
    const historialArray = [...historial]
    document.querySelector('#historial').value = historialArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if(alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 2000);
}

// Eliminar Publicaciones
const accionesListado = e => {
    e.preventDefault();

    if(e.target.dataset.eliminar){
        // Eliminar por axios
        Swal.fire({
            title: '¿Confirmar Eliminación?',
            text: "Una vez eliminada, no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar',
            cancelButtonText: 'No, Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                // Enviar la petición con axios 
                const url = `${location.origin}/publicaciones/eliminar/${e.target.dataset.eliminar}`;

                // Axios para eliminar el registro
                axios.delete(url, { params: {url} })
                    .then(function(respuesta){
                        if(respuesta.status === 200) {
                            Swal.fire(
                                'Eliminado',
                                respuesta.data,
                                'success'
                            );

                            // TODO: Eliminar del DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Hubo un error',
                            text: 'No se pudo eliminar'
                        })
                    })
            }
        })
    } else if(e.target.tagName === 'A') {
        window.location.href = e.target.href;
    }
}