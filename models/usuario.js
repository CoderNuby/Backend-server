var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

//Modelo del esquema
var usuarioEsquema = new Schema({
    nombre: { type: String, required: [ true, 'El nombre es necesario']},
    email: { type: String, unique:true, required: [true, 'El correo es necesario']},
    password: { type: String, required: [true, 'La contraseña es necesaria']},
    imagen: { type: String, required: false},
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos}
});
//Validacion de campo unico
usuarioEsquema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico'});
/*
Primer parametro "Nombre del esquema"
Segundo parametro "El objeto o esquema"
*/
module.exports = mongoose.model('Usuario', usuarioEsquema);