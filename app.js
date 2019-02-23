//Requires
var express = require('express');
var mongoose = require('mongoose');


//Inicializar variables
var app = express();


//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
    if(error) throw error;
    console.log('\x1b[34mBase de datos: \x1b[0m \x1b[32monline\x1b[0m');
});


//Rutas
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Hello world desde el servidor'
    });
});



//Escuchar peticiones
app.listen(3000, () => {
    console.log('Expres server \x1b[33mpuerto 3000:\x1b[0m \x1b[32monline\x1b[0m');
});


