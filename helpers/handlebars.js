module.exports = {
    seleccionarHistorial: (seleccionadas = [], opciones) => {
        const historial = ['VACUNADO', 'VACUNADA', 'ESTERILIZADO', 'ESTERILIZADA', 'DESPARASITADO', 'DESPARASITADA', 'DISCAPACITADO', 'DISCAPACITADA', 'SIN HISTORIAL MEDICO'];

        let html = '';
        historial.forEach(condicion => {
            html += `
                <li ${seleccionadas.includes(condicion) ? 'class="activo"' : ''}>${condicion}</li>
            `;
        });

        return opciones.fn().html = html;
    },
    tipoTamano: (seleccionado, opciones) => {
        return opciones.fn(this).replace(
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )
    },
    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores);

        let html = '';
        if(categoria.length) {
            errores[categoria].forEach(error => {
                html += `<div class="${categoria} alerta">
                    ${error}
                </div>`;
            })
        }
        return alertas.fn().html = html;
    }
}