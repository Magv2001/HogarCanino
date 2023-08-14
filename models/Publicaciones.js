const Sequelize = require('sequelize');
const db = require('../config/db');
const slug = require('slug');
const shortid = require('shortid');
const Usuarios = require('./Usuarios');

const Publicaciones = db.define('publicaciones', {
    titulo: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
        validate: {
            notEmpty: {
                msg: 'El título no puede ir vacío'
            }
        }
    },
    imagen: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'La imagen es obligatoria'
            }
        }
    },
    raza: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
        validate: {
            notEmpty: {
                msg: 'La raza no puede ir vacía'
            }
        }
    },
    tamano: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
        validate: {
            notNull: {
                msg:'El tamaño no puede ir vacío'
            }
        }
    },
    sexo: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
        validate: {
            notEmpty: {
                msg: 'El sexo no puede ir vacío'
            }
        }
    },
    ubicacion: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
        validate: {
            notEmpty: {
                msg: 'La ubicación no puede ir vacía'
            }
        }
    },
    descripcion: {
        type: Sequelize.STRING(1000),
        allowNull: false,   
        trim: true,
        validate: {
            notEmpty: {
                msg: 'La descripción no puede ir vacía'
            }
        }
    },
    url: {
        type: Sequelize.STRING,
        lowercase: true
    },
    historial: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Escoge al menos una opción del historial médico'
            }
        }
    },
    adoptantes: {
        type: Sequelize.ARRAY(Sequelize.JSON)
    }
}, {
    hooks: {
        beforeCreate: (publicacion) => {
            const url = slug(publicacion.titulo);
            publicacion.url = `${url}-${shortid.generate()}`;
        }
    }
});

Publicaciones.belongsTo(Usuarios);

module.exports = Publicaciones;