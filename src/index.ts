import Client from './client';

var client1 = new Client('client1', '127.0.0.1', 5551);
var client2 = new Client('client2', '127.0.0.1', 5552);

async function startClients(): Promise<void> {

    await client1.init();
    await client2.init();
}

startClients()
.then(() => {
    client1.connect('127.0.0.1', 5552);
    client2.connect('127.0.0.1', 5551);
})
.catch((error: any) => {
    console.log("Error al iniciar los clientes:");
    console.log(error);
    process.exit();
});

function closeClients(): void {
    client1.close()
    client2.close()
    process.exit();
}

// Escucha la señal CTRL + C y cierra el programa correctamente
process.on('SIGINT', closeClients);