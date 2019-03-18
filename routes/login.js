var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

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