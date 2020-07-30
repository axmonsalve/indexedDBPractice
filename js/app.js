let DB;


//Selectores de la interfaz
const
  form = document.querySelector('form'),
  nombreMascota = document.querySelector('#mascota'),
  nombreCliente = document.querySelector('#cliente'),
  telefono = document.querySelector('#telefono'),
  fecha = document.querySelector('#fecha'),
  hora = document.querySelector('#hora'),
  sintomas = document.querySelector('#sintomas'),
  citas = document.querySelector('#citas'),
  headingAdministra = document.querySelector('#administra');

//Esperar el DOM Ready - IndexedDB requiere que esté cargado el DOM
document.addEventListener('DOMContentLoaded', () => {
  //Crear la base de datos
  let crearDB = window.indexedDB.open('citas', 1);

  //Si ocurre un error lo enviamos a la consola
  crearDB.onerror = function () {
    console.log('Hubo un error');
  }

  //Si todo va bien, mostrar en consola y asignar la BD
  crearDB.onsuccess = function () {

    //Asignar a la base de datos
    DB = crearDB.result;
  }

  //Este metodo solo corre una vez y es ideal para crear el schema
  crearDB.onupgradeneeded = function (e) {
    //El evento (e) corresponde a la base de datos
    let db = e.target.result;

    //Definir el objectStore, este toma dos parametros: [Nombre de la BD] y las [Opciones]
    //keyPath = llave primaria o indice de la bd
    let objectStore = db.createObjectStore('citas', {
      keyPath: 'key',
      autoIncrement: true
    });

    //crear los indices y campos en la base de datos. createIndex: 3 parametros, nombre, keypath y opciones.

    objectStore.createIndex('mascota', 'mascota', {
      unique: false
    });
    objectStore.createIndex('cliente', 'cliente', {
      unique: false
    });
    objectStore.createIndex('telefono', 'telefono', {
      unique: false
    });
    objectStore.createIndex('fecha', 'fecha', {
      unique: false
    });
    objectStore.createIndex('hora', 'hora', {
      unique: false
    });
    objectStore.createIndex('sintomas', 'sintomas', {
      unique: false
    });

    console.log('Base de datos creada y lista!');
  }

  //Cuando el formulario se envía
  form.addEventListener('submit', agregarDatos);

  function agregarDatos(e) {
    e.preventDefault();

    //Creamos el objeto
    const nuevaCita = {
      mascota: nombreMascota.value,
      cliente: nombreCliente.value,
      telefono: telefono.value,
      fecha: fecha.value,
      hora: hora.value,
      sintomas: sintomas.value,
    }
    console.log(nuevaCita);
  }
});