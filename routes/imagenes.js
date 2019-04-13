var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:coleccion/:imagen', (request, response, next)=> {
    var tipo = request.params.coleccion;
    var imagen = request.params.imagen;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${imagen}`);

    if(fs.existsSync(pathImagen)){
        response.sendFile(pathImagen);
    }else{
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
    }
});

module.exports = app;