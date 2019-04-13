var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



//==================================================
//Busqueda por coleccion
//==================================================
app.get('/coleccion/:tabla/:busqueda', (request, response)=> {
	var tabla = request.params.tabla;
	var busqueda = request.params.busqueda;
	var regularExpression = RegExp(busqueda, 'i');

	var promesa;
	
	switch(tabla){
		case 'usuario':
			promesa = buscarUsuarios(busqueda, regularExpression);
		break;
		case 'hospital':
			promesa = buscarUsuarios(busqueda, regularExpression);
		break;
		case 'medico':
			promesa = buscarUsuarios(busqueda, regularExpression);
		break;
		default:
			return response.status(400).json({
				ok: false,
				mensaje: 'Los tipos de busqueda solo son: usuario, hospital y medico',
				error: { message: 'Tipo de tabla/coleccion no valido'}
			});
		break;
	}
	promesa.then(data => {
		response.status(200).json({
			ok: true,
			[tabla]: data
		});
	});
});

//==================================================
//busqueda en todas las rutas
//==================================================
app.get('/todo/:busqueda', (request, response, next)=> {
	var busqueda = request.params.busqueda;
	var regularExpression = RegExp(busqueda, 'i');

	Promise.all([
		buscarHospitales(busqueda, regularExpression),
		buscarMedicos(busqueda, regularExpression),
		buscarUsuarios(busqueda, regularExpression)
	]).then((respuestas)=> {
		response.status(200).json({
			ok: true,
			hospitales: respuestas[0],
			medicos: respuestas[1],
			usuarios: respuestas[2]
		});
	});
});

function buscarHospitales(busqueda, regularExpression){
	return new Promise((resolve, reject)=> {
		Hospital.find({nombre: regularExpression})
		.populate('usuario', 'nombre email')
		.exec((error, hospitales)=> {
			if(error){
				reject('Error al cargar hospitales', error);
			}else{
				resolve(hospitales);
			}
		});
	});
}
function buscarMedicos(busqueda, regularExpression){
	return new Promise((resolve, reject)=> {
		Medico.find({nombre: regularExpression})
		.populate('usuario', 'nombre email').populate('hospital', 'nombre').exec((error, medicos)=> {
			if(error){
				reject('Error al cargar medicos', error);
			}else{
				resolve(medicos);
			}
		});
	});
}
function buscarUsuarios(busqueda, regularExpression){
	return new Promise((resolve, reject)=> {
		Usuario.find({}, 'nombre email role').or([ {'nombre':regularExpression}, {'email': regularExpression}])
		.exec((error, usuarios)=> {
			if(error){
				reject('Error al cargar usuario', error);
			}else{
				resolve(usuarios);
			}
		});
	});
}
module.exports = app;