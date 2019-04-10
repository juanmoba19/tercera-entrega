const express = require('express')
const app = express ()
const path = require('path')
const hbs = require ('hbs');
const dirPartials = path.join(__dirname, '../../template/partials');
const dirViews = path.join(__dirname, '../../template/views')
const bcrypt = require('bcrypt');
const Curso = require('../models/curso');
const Inscripcion = require('../models/inscripcion');
const Usuario = require('../models/usuario');

require('./../helpers/helpers')

//hbs
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/crear-curso', (req, res) => {
    res.render('crear-curso');
});

app.get('/ver-cursos', (req, res) => {

    Curso.find({},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('ver-cursos',{
			listado : respuesta
		})
	});
}),

app.post('/guardar-curso', (req, res) => {

    let cursoShema = new Curso({
        id: req.body.id,
        nombre: req.body.nombre,
        modalidad: req.body.modalidad == '- Seleccionar -' ? '-' : req.body.modalidad,
        valor: req.body.valor,
        descripcion: req.body.descripcion,
        intensidad: req.body.intensidad || '-'
    });
    cursoShema.save((err, resultado) => {
        if(err) {
            return res.render ('indexpost', {
				mostrar : err
			})	
        }
        Curso.find({},(err,respuesta)=>{
            if (err){
                return console.log(err)
            }
    
            res.render ('ver-cursos',{
                listado : respuesta
            })
        });	
    });
});

app.post('/guardar-inscripcion', (req, res) => {

    let inscripcionShema = new Inscripcion({
        id: req.body.id,
        email: req.body.email,
        nombre: req.body.nombre,
        telefono: req.body.telefono,
        curso: req.body.curso
    });
    inscripcionShema.save((err, resultado) => {
        if(err) {
            res.render ('error',{
                mensaje : err
            });
        }
        res.render ('inscribir',{
            listaCursos : resultado
        });
    });

});

app.get('/inscribir', (req, res) => {
    Curso.find({},(err,respuesta)=>{
		if (err){
			return res.render ('indexpost', {
				mostrar : err
			});
		}
		res.render ('inscribir',{
			listaCursos : respuesta
		})
	});
});

app.get('/ver-inscritos', (req, res) => {
    Curso.find({},(err, cursos)=>{
		if (err){
			return console.log(err)
		}

		Inscripcion.find({},(err, inscripcion)=>{
            if (err){
                return console.log(err)
            }
    
            res.render('inscritos', {
                cursos: cursos,
                inscripcion, inscripcion
            });
        });	
	});
});

app.post('/eliminar-inscritos', (req, res) => {
    let split = req.body.idCursoEst.split(',');
    Inscripcion.findOneAndDelete({curso : split[0], id: split[1]}, req.body, (err, resultados) => {
		if (err){
			return res.render ('indexpost', {
				mostrar : err
			});
        }
        Curso.find({},(err, cursos)=>{
            if (err){
                return console.log(err)
            }
    
            Inscripcion.find({},(err, inscripcion)=>{
                if (err){
                    return console.log(err)
                }
        
                res.render('inscritos', {
                    cursos: cursos,
                    inscripcion, inscripcion
                });
            });	
        });
	});
    
});

app.post('/cambiar-estado', (req, res) => {

    Curso.find({id : Number(req.body.idCurso)},(err, cursoFind)=>{
		if (err){
			return res.render ('indexpost', {
				mostrar : err
			});
        }
        console.log("Respues" + cursoFind[0]);
        let estado = '';
        if (cursoFind[0].estado == 'Disponible') {
            estado = 'Cerrado';
        } else {
            estado = 'Disponible'
        }
        console.log("Estado " + estado);

		Curso.findOneAndUpdate({id : req.body.idCurso}, { $set: { estado: estado }}, (err, resultados) => {
            if (err){
                return console.log(err)
            }
            Curso.find({},(err,respuesta)=>{
                if (err){
                    return console.log(err)
                }
        
                res.render ('ver-cursos',{
                    listado : respuesta
                })
            });
        });
	});
    
});

app.get('/guardar-usuario', (req, res) => {
    res.render('crear-usuario');
});

app.post('/guardar-usuario', (req, res) => {
    let usuario = new Usuario ({
        documento: req.body.documento,
		nombre : req.body.nombre,
		password : bcrypt.hashSync(req.body.password, 10),
        email: req.body.email,
        telefono: req.body.telefono,
        tipo: req.body.rol
	})

	usuario.save((err, resultado) => {
		if (err){
			return res.render ('indexpost', {
				mostrar : err
			})			
		}		
		res.render ('indexpost', {			
				mostrar : 'Se ha creado el usuario: ' + resultado.nombre
			})		
	})	
});

app.post('/ingresar', (req, res) => {	
	Usuario.findOne({documento : req.body.documento}, (err, resultados) => {
		if (err){
			return res.render ('indexpost', {
				mostrar : err
			});
		}
		if(!resultados){
			return res.render ('ingresar', {
			mensaje : "Usuario no encontrado"			
			});
		}
		if(!bcrypt.compareSync(req.body.password, resultados.password)){
			return res.render ('ingresar', {
			mensaje : "Contraseña no es correcta"			
			});
		}	
        req.session.usuario = resultados._id;
        req.session.nombre = resultados.nombre;
        req.session.rolAspirante = resultados.tipo == 'aspirante' ? true : false;
        
        res.render('ingresar', {
            mensaje : "Bienvenido " + resultados.nombre,
            nombre : resultados.nombre,
            rolAspirante: resultados.tipo == 'aspirante' ? true : false,
            sesion : true						
        });
	})	
});

app.get('/salir', (req, res) => {
	req.session.destroy((err) => {
  		if (err) return console.log(err) 	
	})
	res.redirect('/')	
});

module.exports = app