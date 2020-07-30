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

    mostrarCitas();
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
    // console.log(nuevaCita);

    //En indexedDb se utilizan las transacciones
    let transaction = DB.transaction(['citas'], 'readwrite');
    let objectStore = transaction.objectStore('citas');
    // console.log(objectStore);
    let request = objectStore.add(nuevaCita);

    // console.log(request);
    request.onsuccess = () => {
      form.reset();
    }

    transaction.oncomplete = () => {
      console.log('Cita agendada');
      mostrarCitas();
    }

    transaction.onerror = () => {
      console.log('Hubo un error');
    }
  }

  function mostrarCitas() {
    //Limpiar las citas anteriores en caso de que hayan
    while (citas.firstChild) {
      citas.removeChild(citas.firstChild);
    }

    //Creamos un objectStore
    let objectStore = DB.transaction('citas').objectStore('citas');

    //Esto retorna una peticion
    objectStore.openCursor().onsuccess = function (e) {
      //El cursor se va ubicar en el registro indicado para acceder a los datos
      let cursor = e.target.result;

      // console.log(cursor);

      if (cursor) {
        let citaHTML = document.createElement('li');
        citaHTML.setAttribute('data-cita-id', cursor.value.key);
        citaHTML.classList.add('list-group-item');

        citaHTML.innerHTML = `
          <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
          <p class="font-weight-bold">Dueño: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
          <p class="font-weight-bold">Telefono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
          <p class="font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
          <p class="font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
          <p class="font-weight-bold">Síntomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
        `;

        //Boton de borrar
        const botonBorrar = document.createElement('button');
        botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
        botonBorrar.innerHTML = '<span aria-hidden="true">x</span> Borrar';
        botonBorrar.onclick = borrarCita;
        citaHTML.appendChild(botonBorrar);

        //Append en el padre
        citas.appendChild(citaHTML);

        //IMPORTANTE
        //En el caso que tenga mas registros le decimos que continue para que los consulte
        cursor.continue();
      } else {
        if (!citas.firstChild) {
          //Cuando no hay registros (no hay cursor)
          headingAdministra.textContent = 'Agrega citas para comenzar'
          let listado = document.createElement('p');
          listado.classList.add('text-center', 'bg-info', 'text-white', 'py-2', 'h4');
          listado.textContent = 'No hay registros';
          citas.appendChild(listado);
        } else {
          headingAdministra.textContent = 'Administra las citas';
        }

      }
    }
  }

  function borrarCita(e) {
    //Traigo el id (con traversing) del list item clickeado mediante el atributo data. 
    let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));

    //Creamos la transaccion para eliminar
    //En indexedDb se utilizan las transacciones
    let transaction = DB.transaction(['citas'], 'readwrite');
    let objectStore = transaction.objectStore('citas');

    let request = objectStore.delete(citaID);

    //Quitar del DOM el registro
    transaction.oncomplete = () => {
      //Hacemos traversing para eliminar
      e.target.parentElement.parentElement.removeChild(e.target.parentElement);
      console.log(`Se eliminó la cita con el id ${citaID}`);
      if (!citas.firstChild) {
        //Cuando no hay registros (no hay cursor)
        headingAdministra.textContent = 'Agrega citas para comenzar'
        let listado = document.createElement('p');
        listado.classList.add('text-center', 'bg-info', 'text-white', 'py-2', 'h4');
        listado.textContent = 'No hay registros';
        citas.appendChild(listado);
      } else {
        headingAdministra.textContent = 'Administra las citas';
      }
    }
  }
});