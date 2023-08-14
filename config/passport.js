const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    }, async (email, password, done) => {
        const usuario = await Usuarios.findOne({ where: { email } });
        if(!usuario) return done(null, false, {
            message: 'Usuario No Existente'
        });

        // El usuario existe
        const verificarPass = usuario.validarPassword(password);
        if(!verificarPass) return done(null, false, {
            message: 'Password Incorrecto'
        });

        // Usuario existe y el password es correcto
        return done(null, usuario);
}));

passport.serializeUser((usuario, done) => done(null, usuario.id));

passport.deserializeUser(async (id, done) => {
    const usuario = await Usuarios.findByPk(id);
    return done(null, usuario);
});

module.exports = passport;