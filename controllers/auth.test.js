const { verificarUsuario, mostrarPanel } = require('./authController');
const Publicacion = require('../models/Publicaciones');

describe('verificarUsuario', () => {
    it('debería pasar al siguiente middleware si el usuario está autenticado', () => {
        const req = {
            isAuthenticated: jest.fn().mockReturnValue(true),
        };
        const next = jest.fn();

        verificarUsuario(req, {}, next);

        expect(next).toHaveBeenCalled();
    });

    it('debería redirigir a "/iniciar-sesion" si el usuario no está autenticado', () => {
        const req = {
            isAuthenticated: jest.fn().mockReturnValue(false),
        };
        const res = {
            redirect: jest.fn(),
        };

        verificarUsuario(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/iniciar-sesion');
    });
});

describe('mostrarPanel', () => {
    it('debería renderizar la vista "administracion" correctamente', async () => {
        const req = {
            user: {
                id: 1,
                nombre: 'Martin',
                imagen: 'imagen-de-prueba.jpg',
            },
        };
        const res = {
            render: jest.fn(),
        };
        const publicaciones = [{ id: 1, titulo: 'Publicación de prueba' }];

        jest.spyOn(Publicacion, 'findAll').mockResolvedValue(publicaciones);

        await mostrarPanel(req, res);

        expect(res.render).toHaveBeenCalledWith('administracion', {
            nombrePagina: 'Panel de Administración',
            tagline: 'Crea y Administra tus publicaciones desde aquí',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            publicaciones,
        });
    });
});