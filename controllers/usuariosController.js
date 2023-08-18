const Usuarios = require('../models/Usuarios');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

// Opciones de Multer
const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/perfiles/');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            // El formato es válido
            next(null, true);
        } else {
            // El formato no es válido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
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
            res.redirect('/administracion');
            return;
        } else {
            return next();
        }
    })
}

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en HogarCanino',
        tagline: 'Comienza a crear tus propias publicaciones de adopción, solo debes crear una cuenta'
    })
}

exports.validarRegistro = async (req, res, next) => {
    try {
        //Sanitizar
        req.sanitizeBody('nombre').escape();
        req.sanitizeBody('email').escape();
        req.sanitizeBody('password').escape();
        req.sanitizeBody('confirmar').escape();

        // validar
        req.checkBody('nombre', 'El Nombre es Obligatorio').notEmpty();
        req.checkBody('email', 'El email debe ser valido').isEmail();
        req.checkBody('password', 'El password no puede ir vacio').notEmpty();
        req.checkBody('confirmar', 'Repetir password no puede ir vacio').notEmpty();
        req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

        const errores = req.validationErrors();

        if (errores) {
            // si hay errores
            req.flash('error', errores.map(error => error.msg));
            res.render('crear-cuenta', {
                nombrePagina: 'Crea tu cuenta en HogarCanino',
                tagline:
                    'Comienza a crear tus propias publicaciones de adopción, solo debes crear una cuenta',
                mensajes: req.flash(),
            });
            return;
        }

        // Verificar si el correo electrónico ya está registrado
        const usuarioExistente = await Usuarios.findOne({ where: { email: req.body.email } });
        if (usuarioExistente) {
            req.flash('error', 'El correo electrónico ya está registrado');
            res.render('crear-cuenta', {
                nombrePagina: 'Crea tu cuenta en HogarCanino',
                tagline:
                    'Comienza a crear tus propias publicaciones de adopción, solo debes crear una cuenta',
                mensajes: req.flash(),
            });
            return;
        }

        // Si toda la validación es correcta
        next();
    } catch (error) {
        next(error);
    }
}

exports.crearUsuario = async (req, res) => {
    // Crear el usuario
    const usuario = req.body;

    try {
        await Usuarios.create(usuario);

        req.flash('correcto', 'Se creó tu cuenta de HogarCanino');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}

// Formulario para Iniciar Sesión
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión HogarCanino'
    })
}

// Form editar el Perfil
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en HogarCanino',
        usuario,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

// Guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password) {
        usuario.password = req.body.password
    }
    // Si hay imagen anterior y nueva, se borra la anterior
    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        // Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }

    if(req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('correcto', 'Cambios Guardados Correctamente');
    // Redirect
    res.redirect('/administracion');
}

// Sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);
    // Sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }
    // Validar
    req.checkBody('nombre', 'El nombre no puede ir vacío').notEmpty();
    req.checkBody('email', 'El correo no puede ir vacío').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        req.flash('error', errores.map(error => error.msg));

        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en HogarCanino',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        });
        return;
    }
    next(); // Todo bien, siguiente middleware
}
