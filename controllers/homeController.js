const Publicacion = require('../models/Publicaciones');

exports.mostrarPublicaciones = async (req, res, next) => {

    const publicaciones = await Publicacion.findAll();

    if(!publicaciones) return next();

    res.render('home', {
        nombrePagina: 'HogarCanino',
        tagline: 'Encuentra y Crea publicaciones para posibles adoptantes',
        barra: true,
        boton: true,
        publicaciones
    })
}