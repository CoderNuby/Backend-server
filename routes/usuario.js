var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middelwares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//==================================================
//Obtener todos lo usuarios
//==================================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email imagen role').skip(desde).limit(5).exec((error, usuarios) => {
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: error
            });
        }
        Usuario.count({}, (error, conteo)=> {
            if(error){
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al contar usuario',
                    errors: error
                });
            }
            response.status(200).json({
                ok: true,
                usuarios: usuarios,
                totalUsuarios: conteo
            });
        });
    });
});


//==================================================
//Actualizar usuario
//==================================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Usuario.findById(id, (error, usuario) => {
        
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                error: error
            });
        }
        if(!usuario){
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id '+id+' no existe',
                errors: {message: 'No existe el usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioGuardado) => {
            if(error){
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizar usuario',
                    error: error
                });
            }
            usuarioGuardado.password = ":v";
            response.status(200).json({
                ok:true,
                usuario: usuarioGuardado
            });
        });
    });
});

//==================================================
//Crear un nuevo usuario
//==================================================
app.post('/',  mdAutenticacion.verificaToken , (request, response) => {
    var body = request.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        imagen: body.imagen,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {
        if(error){
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                error: error
            });
        }
        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: request.usuario
        });
    });
});

//==================================================
//Borrar Usuario por el ID
//==================================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                error: error
            });
        }
        if(!usuarioBorrado){
            return response.status(500).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: {message: 'No existe un usuario con ese ID'}
            });
        }
        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;