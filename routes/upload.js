var express = require('express');

var fileUpload = require('express-fileupload');

var fs = require('fs');

var app = express();
//importar modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

//default options
app.use(fileUpload());

app.put('/:coleccion/:id', (request, response, next)=> {
    var coleccion = request.params.coleccion;
    var id = request.params.id;
    //tipos de coleccion
    var coleccionesValidas = ['hospitales', 'medicos', 'usuarios'];
    //Validar tipo de coleccion
    if(coleccionesValidas.indexOf(coleccion) < 0){
        return response.status(400).json({
            ok: true,
            mensaje: 'La coleccion '+coleccion+' no es valida',
            errors: {message: 'Las colecciones validas son: '+coleccionesValidas.join(', ')}
        });
    }

    if(!request.files){
        return response.status(400).json({
            ok: true,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen'}
        });
    }
    //Obtener extencion del archivo
    var archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extencionArchivo = nombreCortado[nombreCortado.length - 1];

    //Extenciones permitidas
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extencionesValidas.indexOf(extencionArchivo) < 0){
        return response.status(400).json({
            ok: true,
            mensaje: 'La extencion '+extencionArchivo+' no es valida',
            errors: {message: 'Las extenciones validas son: '+extencionesValidas.join(', ')}
        });
    }

    //Nombre del archivo personalizado
    var nombreArchivo = `${ id }-${new Date().getMilliseconds()}.${extencionArchivo}`;

    //Mover archivo del temporal al path
    var path = `./uploads/${coleccion}/${nombreArchivo}`;
    archivo.mv(path, (error)=> {
        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: error
            });
        }
        subirPorTipo(coleccion, id, nombreArchivo, response);
    });

});

function subirPorTipo(colleccion, id, nombreArchivo, response){
    switch(colleccion){
        case "usuarios":
            Usuario.findById(id).select('nombre email imagen role').exec((error, usuario)=> {
                    if(!usuario){
                        return response.status(400).json({
                            ok: false,
                            mensaje: 'El usuario no existe',
                            errors: { message: 'Introduce un id valido'}
                        });
                    }
                    if(error){
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar usuario',
                            error: error
                        });
                    }
                    
                    var pathViejo = './uploads/usuarios/'+usuario.imagen;
    
                    //si existe, elimina la imagen anterior
                    if(fs.existsSync(pathViejo)){
                        fs.unlink(pathViejo, (error)=> {
                            if(error){
                                return response.status(500).json({
                                    ok: false,
                                    mensaje: 'Error al borrar imagen',
                                    errors: error
                                });
                            }
                        });
                    }
                    usuario.imagen = nombreArchivo;
                    usuario.save((error, usuarioActualizado)=> {
                            if(error){
                                return response.status(400).json({
                                    ok: false,
                                    mensaje: 'Error al guardar imagen',
                                    error: error
                                });
                            }
                            return response.status(200).json({
                                ok: true,
                                mensaje: 'Imagen de usuario actualizado',
                                usuarioActualizado: usuarioActualizado
                            });
                    });
            });
        break;

        case "medicos":
            Medico.findById(id).populate('hospital', 'nombre').populate('usuario', 'nombre email').exec((error, medico)=> {
                if(!medico){
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'El medico no existe',
                        errors: { message: 'Introduce un id valido'}
                    });
                }
                if(error){
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar medico',
                        error: error
                    });
                }
                
                var pathViejo = './uploads/medicos/'+medico.imagen;

                //si existe, elimina la imagen anterior
                if(fs.existsSync(pathViejo)){
                    fs.unlink(pathViejo, (error)=> {
                        if(error){
                            return response.status(500).json({
                                ok: false,
                                mensaje: 'Error al borrar imagen',
                                errors: error
                            });
                        }
                    });
                }
                medico.imagen = nombreArchivo;
                medico.save((error, medicoActualizado)=> {
                        if(error){
                            return response.status(500).json({
                                ok: false,
                                mensaje: 'Error guardando imagen',
                                errors: error
                            });
                        }
                        return response.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de medico actualizado',
                            medicoActualizado: medicoActualizado
                        });
                });
            });
        break;

        case "hospitales":
            Hospital.findById(id).populate('usuario', 'nombre email').exec((error, hospital)=> {
                if(!hospital){
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'El hospital no existe',
                        errors: { message: 'Introduce un id valido'}
                    });
                }
                if(error){
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar hospital',
                        error: error
                    });
                }
                
                var pathViejo = './uploads/hospitales/'+hospital.imagen;

                //si existe, elimina la imagen anterior
                if(fs.existsSync(pathViejo)){
                    fs.unlink(pathViejo, (error)=> {
                        if(error){
                            return response.status(500).json({
                                ok: false,
                                mensaje: 'Error al borrar imagen',
                                errors: error
                            });
                        }
                    });
                }
                hospital.imagen = nombreArchivo;
                hospital.save((error, hospitalActualizado)=> {
                        if(error){
                            return response.status(500).json({
                                ok: false,
                                mensaje: 'Error guardando imagen',
                                errors: error
                            });
                        }
                        return response.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de hospital actualizado',
                            hospitalActualizado: hospitalActualizado
                        });
                });
            });
        break;
        default:
            console.error("Entro al case dafault usted no a escogido una coleccion o esa coleccion no existe");
        break;
    }
}

module.exports = app;