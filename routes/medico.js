var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middelwares/autenticacion');

var app = express();

var Medico = require('../models/medico');

//==================================================
//Obtener todos lo medicos
//==================================================
app.get('/', (request, response, next)=> {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({}).skip(desde).limit(5).populate('usuario', 'nombre email').populate('hospital').exec((error, medicos)=> {
        if(error){
            return response.status().json({
                ok: false,
                mensaje: 'Error cargando medico',
                errors: error
            });
        }
        Medico.count({}, (error, conteo)=> {
            if(error){
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al contar medicos',
                    errors: error
                });
            }
            response.status(200).json({
                ok: true,
                medicos: medicos,
                totalMedicos: conteo
            });
        });
    });
});


//==================================================
//Actualizar medico
//==================================================
app.put('/:id_medico', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id_medico;
    var body = request.body;

    Medico.findById(id, (error, medico) => {
        
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                error: error
            });
        }
        if(!medico){
            return response.status(400).json({
                ok: false,
                mensaje: 'El medico con el id '+id+' no existe',
                errors: {message: 'No existe el medico con ese ID'}
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = request.usuario._id;

        medico.save((error, medicoGuardado) => {
            if(error){
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizar medico',
                    error: error
                });
            }
            response.status(200).json({
                ok:true,
                medico: medicoGuardado
            });
        });
    });
});

//==================================================
//Crear un nuevo medico
//==================================================
app.post('/',  mdAutenticacion.verificaToken , (request, response) => {
    var body = request.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: request.usuario._id,
        hospital: body.hospital
    });

    medico.save((error, medicoGuardado) => {
        if(error){
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                error: error
            });
        }
        response.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

//==================================================
//Borrar Usuario por el ID
//==================================================
app.delete('/:id_medico', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id_medico;

    Medico.findByIdAndRemove(id, (error, medicoBorrado) => {
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                error: error
            });
        }
        if(!medicoBorrado){
            return response.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: {message: 'No existe un medico con ese ID'}
            });
        }
        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;