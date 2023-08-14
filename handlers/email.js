const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const handlebars = require('nodemailer-express-handlebars');
const util = require('util');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

// Utilizar templates de handlebars
transport.use('compile', handlebars({
    viewEngine: {
        extname: '.handlebars',
        layoutsDir: __dirname+'/../views/emails',
        defaultLayout: false,
        partialsDir: __dirname+'/../views/emails'
    },
    viewPath: __dirname+'/../views/emails',
    extName: '.handlebars'
}));

exports.enviar = async (opciones) => {

    const opcionesEmail = {
        from: 'HogarCanino <noreply@hogarcanino.com',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context: {
            resetUrl: opciones.resetUrl
        }
    }

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}