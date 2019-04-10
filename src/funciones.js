const fs = require('fs');
const path = require('path');
const directorioSrc = path.join(__dirname, '../src');
const Curso = require('././models/curso');
let listaCursosEstudiante = [];

var query = Curso.find({}, null);

const listarCursosEstudiante = () => {
    try {
        return listaCursosEstudiante = JSON.parse(fs.readFileSync('./src/listado-cursos-estudiante.json', 'utf8'));
    } catch (err) {
        console.log(err);
        return listaCursosEstudiante = [];
    }

};

let guardarEstudiantes = () => {
    return new Promise(function(resolve, reject) {
        let datos = JSON.stringify(listaCursosEstudiante);
        fs.writeFile(directorioSrc + '/listado-cursos-estudiante.json', datos, (error) => {
            if (error) {
                reject(false);
            } else {
                console.log('Se ha creado el archivo de usuarios y cursos con exito');
                resolve(true);
            }
        });
    });
};

const inscribirCursoEstudiante = (inscripcion) => {
    let texto = '';
    listarCursosEstudiante();
    let duplicado = listaCursosEstudiante.find(elem => elem.id == inscripcion.id && elem.curso == inscripcion.curso);
    if (!duplicado) {
        listaCursosEstudiante.push(inscripcion);
        let result = guardarEstudiantes();
        if (result) {
            texto = '<div class="alert alert-success" role="alert"> \
                        El aspirante ' + inscripcion.nombre + ' se ha inscrito correctamente al curso con id ' + inscripcion.curso + '\
                     </div>';
        } else {
            texto = '<div class="alert alert-danger" role="alert"> \
                     Error en la inscripcion del aspirante \
                </div>';
        }
    } else {
        texto = '<div class="alert alert-danger" role="alert"> \
                     Ya el aspirante se encuentra inscrito en el curso \
                </div>';
    }

    return texto;
};
const cambiarEstadoCurso = (idCurso) => {
    listarCursos();
    let curso = listaCursos.find(elem => elem.id == idCurso);
    if (curso) {
        let estado = curso.estado == 'Disponible' ? 'Cerrado' : 'Disponible'
        curso.estado = estado;
        guardar();
    } else {
        console.log('No existe el curso');
    }
};

let eliminarEstudianteCurso = async (idCurso, idEstudiante) => {
    listarCursosEstudiante();
    console.log("Legan idCurso: " + idCurso + " IdEstudiante: " + idEstudiante);
    console.log("Array sin borrar: " + JSON.stringify(listaCursosEstudiante) );
    let nuevo = listaCursosEstudiante.filter(estCurso => estCurso.id != idEstudiante || estCurso.curso != idCurso);
    console.log("Array con filtro borrar: " + JSON.stringify(nuevo) );
    if (nuevo.length == listaCursosEstudiante.length) {
        console.log(`No existe el estudiante con id ${idEstudiante} matriculado en el curso con id ${idCurso}`);
    } else {
        listaCursosEstudiante = nuevo;
        let result = await guardarEstudiantes();
        if(result) {
            console.log("Se elimino exitosamente");
        } else {
            console.log("Error al eliminar");
        }
    }
};

module.exports = {
    inscribirCursoEstudiante,
    cambiarEstadoCurso,
    eliminarEstudianteCurso
}
