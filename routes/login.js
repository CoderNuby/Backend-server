var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

//Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//==================================================
//Autenticacion de Google
//==================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        imagen: payload.picture,
        google: true,

    }
}
  
app.post('/:google', async (request, response, next)=> {
    var token = request.body.token;
    var googleUser = await verify(token).catch(error=> {
        return response.status(403).json({
            ok: false,
            mensaje: 'Token no valido',
            errors: error
        });
    });
    Usuario.findOne({email: googleUser.email}, (error, usuarioDB)=> {
        if(error){
            return response.status(500).json({
                ok:false,
                mensaje: 'Error al buscar usuario'
            });
        }
        if(usuarioDB){
            if(usuarioDB.google === false){
                return response.status(400).json({
                    ok:false,
                    mensaje: 'Debe de ser una autenticacion normal'
                });
            }else{
                var token = jwt.sign({ usuario: usuarioDB}, SEED, {expiresIn: 14400})//Expira en 4 horas;
                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        }else {
            //El usuario no existe, hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.imagen = googleUser.imagen;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((error, usuarioDB)=> {
                if(error){
                    return response.status(400).json({
                        ok:false,
                        mensaje: 'Error al guardar usuario'
                    });
                }
                var token = jwt.sign({ usuario: usuarioDB}, SEED, {expiresIn: 14400})//Expira en 4 horas;
                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }
    });
});

//==================================================
//Login de usuario
//==================================================
app.post('/', (request, response) => {
    var body = request.body;

    Usuario.findOne({email: body.email}, (error, usuarioDB) => {
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje:'Error al buscar usuarios',
                error: error
            });
        }
        if(!usuarioDB){
            return response.status(400).json({
                ok: false,
                mensaje:'Credenciales incorrectas-email: '+ body.email,
                errors:error
            });
        }
        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas-password'
            });
        }
        //Crear un token
        usuarioDB.password = ':v';
        var token = jwt.sign({ usuario: usuarioDB}, SEED, {expiresIn: 14400})//Expira en 4 horas;

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});

module.exports = app;