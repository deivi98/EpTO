import Client from './app/client';
import Message from './app/message';
import Event from './internal/event';
import * as fs from 'fs';

/**
 * Programa de testeo de EpTO con numero de nodos indefinido
 */

const n: number = 4;                        // Numero de nodos
const delayMessageMillis: number = 50;      // Tiempo en milisegundos entre envio de mensajes aleatorios
const initialPort: number = 5000;           // Puerto inicial
var clients: Client[] = [];                 // Array de clientes
var messageInterval: NodeJS.Timeout;        // Interval de NodeJS para el envio de mensajes continuado
var nextMessage: number = 0;                // Siguiente id autoincremental de mensaje

// Creamos la carpeta test si no existe
if(!fs.existsSync("test/")) {
    fs.mkdirSync("test/");
}

/**
 * Funcion que crea e inicializa los clientes
 */
async function startClients(): Promise<void[]> {

    var clientPromises: Promise<void>[] = [];

    for(var i = 0; i < n; i++) {
        var client: Client = new Client('client' + (i+1), '127.0.0.1', initialPort + i + 1);
        clientPromises.push(client.init());
        console.log("Preparado cliente " + client.id);
        clients.push(client);
    }

    return Promise.all(clientPromises);
}

/**
 * Funcion que selecciona un cliente aleatorio
 * del array y envia un mensaje
 */
function randomMessage() {

    var clientPos: number = Math.floor(Math.random() * n);
    var randomClient: Client = clients[clientPos];
    
    randomClient.epToBroadcast(new Message("Mensaje automatico " + (++nextMessage)));
}

/**
 * Funcion de escucha y logueo de los mensajes
 * recibidos por un cliente
 * @param client cliente
 */
function listenMessages(client: Client) {

    // Borramos el archivo log si existe un antiguo
    if(fs.existsSync("test/" + client.id + ".log")) {
        fs.unlink('test/' + client.id + '.log', (err) => {
            if (err) throw err;
        });
    }
    
    var nextOutputMessage: number = 0;

    // Cliente escucha un mensaje y lo loguea sincronamente en el log (Para evitar desorden al loguear)
    client.on('message', (event: Event) => {
        // console.log("CLIENT " + client.id + " | " + event.sourceId + "(" + event.id +  ") > " + event.msg.data);
        const msg: string = "(" + (++nextOutputMessage) +  ") " + event.sourceId + "(" + event.id +  ") > " + event.msg.data + '\n';
        fs.appendFileSync('test/' + client.id + '.log', msg, 'utf8');
    });
}

/**
 * Espera a que inicien los clientes
 * para iniciar su escucha y conectarlos
 * cada uno al resto de clientes
 */
startClients()
.then(() => {

    for(var i = 0; i < n; i++) {

        listenMessages(clients[i]);

        for(var e = 0; e < n; e++) {
            if(i != e) {
                clients[i].connect('127.0.0.1', initialPort + e + 1);
            }
        }
    }

    // Inicia el envio continuo de mensajes aleatorios
    messageInterval = setInterval(randomMessage, delayMessageMillis);
})
.catch((error: any) => {
    console.log("Error al iniciar los clientes:");
    console.log(error);
    process.exit();
});

/**
 * Cierra los clientes y sus conexiones correctamente
 * antes de terminar el programa
 */
function closeClients(): void {
    for(var i: 0; i < n; i++) {
        clients[i].close();
    }
    clearInterval(messageInterval);
    console.log("Cerrando conexiones y clientes...");
    setTimeout(function() {
        process.exit();
    }, 2000);
}

// Escucha la señal CTRL + C y cierra el programa correctamente
process.on('SIGINT', closeClients);