var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middelwares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');
//==================================================
//Obtener todos los hospitales
//==================================================
app.get('/',(request, response, next)=> {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre imagen usuario').skip(desde).limit(5).populate('usuario', 'nombre email').exec((error, hospitales) => {
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: error
            });
        }
        Hospital.count({}, (error, conteo)=> {
            if(error){
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error contando hospital',
                    errors: error
                });
            } 
            response.status(200).json({
                ok: true,
                hospitales: hospitales,
                totalHospitales: conteo
            });
        });
    });
});

//==================================================
//Actualizar informacion de hospital
//==================================================
app.put('/:id_hospital', mdAutenticacion.verificaToken,(request, response, next) => {
    var id = request.params.id_hospital;
    var body = request.body;

    Hospital.findById(id, (error, hospital) => {
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                error: error
            });
        }
        if(!hospital){
            return response.status().json({
                ok: false,
                mensaje: 'El hospital con el id '+id+' no existe',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id;

        hospital.save((error, hospitalGuardado) => {
            if(error){
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando hospital',
                    error: error
                });
            }
            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

//==================================================
//Crear un nuevo hospital
//==================================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: request.usuario._id
    });
    hospital.save((error, hospitalGuardado) => {
        if(error){
            return response.satuts(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                error: error
            });
        }
        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

//==================================================
//Borrar hospital por ID
//==================================================
app.delete('/:id_hospital', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id_hospital;

    Hospital.findByIdAndRemove(id, (error, hospitalBorrado)=> {
        if(error){
            return response.status(500).json({
                ok:false,
                mensaje: 'Error al borrar usuario',
                error: error
            });
        }
        if(!hospitalBorrado){
            return response.status(200).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }
        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});
module.exports = app;