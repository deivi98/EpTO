import Client from './app/client';
import Message from './app/message';
import Event from './internal/event';
import * as fs from 'fs';
import * as readlineSync from 'readline-sync';
import * as rimraf from 'rimraf';

/**
 * Programa de testeo de EpTO con numero de nodos indefinido
 */

const delayMessageMillis: number = 50;      // Tiempo en milisegundos entre envio de mensajes aleatorios
var localClients: Client[] = [];            // Array de clientes
var messageInterval: NodeJS.Timeout;        // Interval de NodeJS para el envio de mensajes continuado
var nextMessage: number = 0;                // Siguiente id autoincremental de mensaje
var manual: boolean = false;

if(!fs.existsSync("network.json")) {
    console.log("La configuracion de red (network.json) no existe!");
    process.exit(-1);
}

// Leemos configuracion
const networkConfig = JSON.parse(fs.readFileSync('network.json', 'utf8'));

// Eliminamos la carpeta test si existe y la volvemos a crear
if(fs.existsSync("test/")) {
    rimraf.sync("test/");
}
fs.mkdirSync("test/");

/**
 * Funcion que crea e inicializa los clientes locales
 */
async function startLocalClients(): Promise<void[]> {

    var clientPromises: Promise<void>[] = [];

    const localNetwork = networkConfig["127.0.0.1"];

    if(!localNetwork) {
        console.log("Configuracion de red invalida. Ningun cliente local se ha configurado");
        process.exit(-1);
    }

    const initialPort: number = localNetwork["initialPort"];
    const n: number = localNetwork["clients"];

    for(var i = 1; i <= n; i++) {
        var client: Client = new Client('client' + i, '127.0.0.1', initialPort + i);
        clientPromises.push(client.init());
        console.log("Preparado cliente " + client.id);
        localClients.push(client);
    }

    return Promise.all(clientPromises);
}

/**
 * Funcion que selecciona un cliente aleatorio
 * del array y envia un mensaje
 */
function randomMessage() {

    var clientPos: number = Math.floor(Math.random() * localClients.length);
    var randomClient: Client = localClients[clientPos];
    
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

        if(manual) {
            console.log("CLIENT " + client.id + " | " + event.sourceId + "(" + event.id +  ") > " + event.msg.data);
        } else {
            const msg: string = "(" + (++nextOutputMessage) +  ") " + event.sourceId + "(" + event.id +  ") > " + event.msg.data + '\n';
            fs.appendFileSync('test/' + client.id + '.log', msg, 'utf8');
        }
    });
}

/**
 * Espera a que inicien los clientes
 * para iniciar su escucha y conectarlos
 * cada uno al resto de clientes
 */
startLocalClients()
.then(() => {

    const localNetwork = networkConfig["127.0.0.1"];
    const initialPort: number = localNetwork["initialPort"];
    const n: number = localNetwork["clients"];

    // Conectamos cada cliente local con el resto de los locales
    for(var i = 1; i <= n; i++) {

        listenMessages(localClients[i-1]);

        for(var e = 1; e <= n; e++) {
            if(i != e) {
                localClients[i-1].connect('127.0.0.1', initialPort + e);
            }
        }
    }

    // Conectamos cada cliente local con el resto de clientes de todos los nodos remotos 
    Object.keys(networkConfig).forEach(function(key) {
        if(key != "127.0.0.1") {
            const remoteNodeNetwork = networkConfig[key];
            const initalRemotePort: number = remoteNodeNetwork["initialPort"];
            const m: number = remoteNodeNetwork["clients"];

            for(var i = 1; i <= n; i++) {
                for(var e = 1; e <= m; e++) {
                    localClients[i-1].connect(key, initalRemotePort + e);
                }
            }
        }
    });

    console.log("----------------------------------------------------------------");
    console.log("Todos los clientes han sido iniciados y conectados correctamente");
    
    if(readlineSync.keyInYN('Quieres enviar mensaje manualmente? (Si no, estos se enviaran aleatoriamente cada ' + delayMessageMillis + 'ms)')) {
        console.log("----------------------------------------------------------------");
        console.log("Para enviar mensajes escribe <id_cliente>:<mensaje> y pulsa intro");

        manual = true;
        listenKeyboardMessages();
    } else {
        // Inicia el envio continuo de mensajes aleatorios
        messageInterval = setInterval(randomMessage, delayMessageMillis);
    }

})
.catch((error: any) => {
    console.log("Error al iniciar los clientes:");
    console.log(error);
    process.exit();
});

function listenKeyboardMessages(): void {

    // Escuchamos la entrada para enviar mensajes
    const stdin = process.openStdin();
    stdin.addListener("data", function(d) {
        const cmd: string = d.toString().trim();

        const args = cmd.split(":");
        
        if(args.length > 1) {

            const localClient: Client = localClients.find((client: Client) => {
                return client.id == args[0];
            });

            if(!localClient) {
                console.log("No existe ningun cliente local llamado " + args[0] + "!");
                return;
            }

            localClient.epToBroadcast(new Message(args[1]));
        } else {
            console.log("ERROR: Formato invalido. Para enviar mensajes escribe <id_cliente>:<mensaje> y pulsa intro");
        }
    });
}

/**
 * Cierra los clientes y sus conexiones correctamente
 * antes de terminar el programa
 */
function closeClients(): void {
    for(var i: 0; i < localClients.length; i++) {
        localClients[i].close();
    }
    clearInterval(messageInterval);
    console.log("Cerrando conexiones y clientes...");
    setTimeout(function() {
        process.exit();
    }, 2000);
}

// Escucha la señal CTRL + C y cierra el programa correctamente
process.on('SIGINT', closeClients);