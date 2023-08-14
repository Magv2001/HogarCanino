const express =  require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const publicacionesController = require('../controllers/publicacionesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarPublicaciones);

    // Crear Publicaciones
    router.get('/publicaciones/nueva', 
        authController.verificarUsuario,
        publicacionesController.formularioNuevaPublicacion
    );
    router.post('/publicaciones/nueva', 
        authController.verificarUsuario,
        publicacionesController.sanitizarPublicacion,
        publicacionesController.subirImagenPerro,
        publicacionesController.agregarPublicacion
    );

    // Mostrar Publicación (singular)
    router.get('/publicaciones/:url', publicacionesController.mostrarPublicacion);

    // Editar Publicación
    router.get('/publicaciones/editar/:url', 
        authController.verificarUsuario,
        publicacionesController.formEditarPublicacion
    );
    router.post('/publicaciones/editar/:url', 
        authController.verificarUsuario,
        publicacionesController.subirImagenPerro,
        publicacionesController.editarPublicacion
    );

    // Eliminar Publicaciones
    router.delete('/publicaciones/eliminar/:id', 
        publicacionesController.eliminarPublicacion
    );

    // Crear Cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );

    // Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    // Cerrar Sesión
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    // Resetear password (emails)
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);

    // Resetear Password ( Almacenar en la BD )
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarPassword);

    // Panel de administración
    router.get('/administracion', 
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    // Editar Perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil', 
        authController.verificarUsuario,
        //usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    );

    // Recibir Mensajes de Adoptantes
    router.post('/publicaciones/:url', 
        publicacionesController.contactar
    );

    // Muestra los candidatos por publicación
    router.get('/adoptantes/:id', 
        authController.verificarUsuario,
        publicacionesController.mostrarAdoptantes
    );

    // Denunciar publicación
    router.get('/publicaciones/denuncia', publicacionesController.formDenunciarPublicacion);
    router.post('/publicaciones/denuncia', publicacionesController.denunciarPublicacion);

    // Buscador de Publicaciones
    router.post('/buscador', publicacionesController.buscarPublicaciones);

    return router;
}