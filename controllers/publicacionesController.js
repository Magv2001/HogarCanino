const Publicacion = require('../models/Publicaciones');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Usuarios = require('../models/Usuarios');
const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const { Op } = require('sequelize');

const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/publicaciones/');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // El formato es valido
            next(null, true);
        } else {
            // El formato no es valido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

// Sube imagen en el servidor
exports.subirImagenPerro = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb');
                } else {
                    req.flash('error', err.message);
                }
            } else if (err.hasOwnProperty('message')) {
                req.flash('error', err.message);
            }
            res.redirect('back');
            return;
        } else {
            return next();
        }
    })
}

exports.formularioNuevaPublicacion = (req, res) => {
    res.render('nueva-publicacion', {
        nombrePagina: 'Nueva Publicación',
        tagline: 'Llena el formulario y crea tu publicación',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

// Agrega las publicaciones a la base de datos
exports.agregarPublicacion = async (req, res) => {
    const publicacion = req.body;

    // Usuario autor de la publicación
    publicacion.usuarioId = req.user.id;

    // Leer la imagen
    if (req.file) {
        publicacion.imagen = req.file.filename;
    }

    // Crear arreglo para el historial
    publicacion.historial = req.body.historial.split(',');

    // Almacenarlo en la base de datos 
    try {
        const nuevaPublicacion = await Publicacion.create(publicacion);

        // Mostrar mensaje de éxito
        req.flash('correcto', 'Publicación creada correctamente');
        // Redireccionar
        res.redirect(`/publicaciones/${nuevaPublicacion.url}`);
    } catch (error) {

        const erroresSequelize = error.errors.map(err => err.message);

        // Mostrar mensaje de error
        req.flash('error', erroresSequelize);
        res.render('nueva-publicacion', {
            nombrePagina: 'Nueva Publicación',
            tagline: 'Llena el formulario y crea tu publicación',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
    }
}

// Sanitiza las publicaciones
exports.sanitizarPublicacion = (req, res, next) => {
    req.sanitizeBody('titulo')
    req.sanitizeBody('raza')
    req.sanitizeBody('tamano')
    req.sanitizeBody('sexo')
    req.sanitizeBody('ubicacion')
    req.sanitizeBody('historial')

    next();
}

// Muestra una publicación
exports.mostrarPublicacion = async (req, res, next) => {
    const publicacion = await Publicacion.findOne({ where: { url: req.params.url }, include: [{ model: Usuarios, foreignKey: 'usuarioId' }], });

    // Si no hay resultados
    if (!publicacion) return next();

    res.render('publicacion', {
        publicacion,
        nombrePagina: publicacion.titulo,
        barra: true
    })

}

exports.formEditarPublicacion = async (req, res, next) => {
    const publicacion = await Publicacion.findOne({ where: { url: req.params.url } });

    if (!publicacion) return next();

    res.render('editar-publicacion', {
        publicacion,
        nombrePagina: `Editar la publicación - ${publicacion.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.editarPublicacion = async (req, res) => {
    // Obtener la publicación que se quiere actualizar
    const publicacion = await Publicacion.findOne({ where: { url: req.params.url } });

    // Actualizar los valores de la publicación
    publicacion.titulo = req.body.titulo;
    // Si hay imagen anterior y nueva, se borra la anterior
    if (req.file && publicacion.imagen) {
        const imagenPerroAnteriorPath = __dirname + `/../public/uploads/publicaciones/${publicacion.imagen}`;

        // Eliminar archivo con filesystem
        fs.unlink(imagenPerroAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }
    // Si hay una imagen nueva, la guardamos
    if (req.file) {
        publicacion.imagen = req.file.filename;
    }
    publicacion.raza = req.body.raza;
    publicacion.tamano = req.body.tamano;
    publicacion.sexo = req.body.sexo;
    publicacion.ubicacion = req.body.ubicacion;
    publicacion.descripcion = req.body.descripcion;
    publicacion.historial = req.body.historial && req.body.historial.split(',');

    // Guardar los cambios en la base de datos
    try {
        await publicacion.save();
        req.flash('correcto', 'Cambios Almacenados Correctamente');
        res.redirect(`/publicaciones/${publicacion.url}`);
    } catch (error) {
        const publicacion = await Publicacion.findOne({ where: { url: req.params.url } });
        const erroresSequelize = error.errors.map(err => err.message);

        // Mostrar mensaje de error
        req.flash('error', erroresSequelize);
        res.render('editar-publicacion', {
            publicacion,
            nombrePagina: `Editar la publicación - ${publicacion.titulo}`,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        })
    }
}

exports.eliminarPublicacion = async (req, res) => {
    const { id } = req.params;

    const publicacion = await Publicacion.findByPk(id);

    // Si hay imagen, eliminarla
    if (publicacion.imagen) {
        const imagenPerroAnteriorPath = __dirname + `/../public/uploads/publicaciones/${publicacion.imagen}`;

        // Eliminar archivo con filesystem
        fs.unlink(imagenPerroAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        });
    }

    if (verificarAutor(publicacion, req.user)) {
        // Todo bien, si es el usuario, eliminar
        publicacion.destroy();
        res.status(200).send('Publicación Eliminada Correctamente');
    } else {
        // No permitido
        res.status(403).send('Error')
    }
}

const verificarAutor = async (publicacion = {}, usuario = {}) => {
    const autor = await publicacion.getUsuario();
    if (autor.usuarioId !== usuario.id) {
        return false;
    }
    return true;
};

// Almacenar los adoptantes en la BD
exports.contactar = async (req, res, next) => {

    const publicacion = await Publicacion.findOne({ where: { url: req.params.url } });

    // Sino existe la vacante
    if (!publicacion) return next();

    // Todo bien, construir el nuevo objeto
    const nuevoAdoptante = {
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.tel
    };

    // Almacenar el adoptante
    const adoptantes = publicacion.adoptantes || [];
    const nuevosAdoptantes = adoptantes.concat(nuevoAdoptante);
    await publicacion.update({ adoptantes: nuevosAdoptantes });

    // Mensaje flash y redirección
    req.flash('correcto', 'Se ha registrado su solicitud de adopción correctamente');
    res.redirect('/');
}

exports.mostrarAdoptantes = async (req, res, next) => {
    const publicacion = await Publicacion.findByPk(req.params.id);

    if(publicacion.usuarioId != req.user.id) {
        return next();
    } 

    if(!publicacion) return next();

    res.render('adoptantes', {
        nombrePagina: `Adoptantes Publicación - ${publicacion.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        adoptantes: publicacion.adoptantes
    })
}

exports.formDenunciarPublicacion = (req, res) => {
    res.render('denunciar-publicacion', {
        nombrePagina: 'Formulario de Denuncia',
        tagline: 'Llena el siguiente formulario de denuncia y pronto nuestro equipo lo analizará'
    })
}

exports.denunciarPublicacion = async (req, res) => {
    const { titulo, email, infraccion, descripcion } = req.body;

    contentHTML = `
        <h1>Datos de la denuncia</h1>
        <ul>
            <li>Título Publicación: ${titulo}</li>
            <li>E-mail (Creador/ra): ${email}</li>
            <li>Tipo de infracción: ${infraccion}</li>
        </ul>
        <p>Razon de la denuncia: ${descripcion}</p>
    `;
    
    const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        auth: {
            user: emailConfig.user,
            pass: emailConfig.pass
        }
    });

    const info = await transporter.sendMail({
        from: 'Hogar Canino <denuncias@hogarcanino.com',
        to: 'hogarcanino2023@gmail.com',
        subject: 'Formulario de Denuncia',
        html: contentHTML
    });

    console.log('Message sent', info.messageId);

    req.flash('correcto', 'Tu formulario de denuncia se envió correctamente');
    res.redirect('/');
}

// Buscador de Publicaciones
exports.buscarPublicaciones = async (req, res) => {
    const publicaciones = await Publicacion.findAll({
        where: {
            [Op.or]: [
                {
                    raza: {
                        [Op.iLike]: `%${req.body.q}%`
                    }
                },
                {
                    titulo: {
                        [Op.iLike]: `%${req.body.q}%`
                    }
                },
                {
                    ubicacion: {
                        [Op.iLike]: `%${req.body.q}%`
                    }
                }
            ]
        }
    });

    // Mostrar las publicaciones
    res.render('home', {
        nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
        barra: true,
        publicaciones
    });
}



