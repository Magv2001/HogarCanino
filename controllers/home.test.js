const { mostrarPublicaciones } = require('./homeController');
const Publicacion = require('../models/Publicaciones');

describe('mostrarPublicaciones', () => {
    it('debería renderizar la vista "home" con las publicaciones', async () => {
        const req = {};
        const res = {
            render: jest.fn(),
        };

        const publicaciones = [
            { titulo: 'Publicación 1', raza: 'Raza 1', ubicacion: 'Ubicación 1' },
            { titulo: 'Publicación 2', raza: 'Raza 2', ubicacion: 'Ubicación 2' },
        ];

        jest.spyOn(Publicacion, 'findAll').mockResolvedValue(publicaciones);

        await mostrarPublicaciones(req, res);

        expect(res.render).toHaveBeenCalledWith('home', {
            nombrePagina: 'HogarCanino',
            tagline: 'Encuentra y Crea publicaciones para posibles adoptantes',
            barra: true,
            boton: true,
            publicaciones,
        });
    });

    it('debería llamar al siguiente middleware si no hay publicaciones', async () => {
        const req = {};
        const res = {
            render: jest.fn(),
        };

        jest.spyOn(Publicacion, 'findAll').mockResolvedValue(null);

        const next = jest.fn();

        await mostrarPublicaciones(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });
});
