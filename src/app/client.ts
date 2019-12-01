import Process from '../internal/process';
import Message from './message';
import Event from '../internal/event';
import { EventEmitter } from 'events';

export default class Client extends EventEmitter {

    private _id: string;
    private _process: Process;

    constructor(id: string, ip: string, port: number) {
        super();
        this._id = id;
        this._process = new Process("p-" + id, ip, port);
    }
    
    get id(): string {
        return this._id;
    }

    public async init(): Promise<void> {

        this._process.on('message', (event: Event) => {
            this.emit('message', event);
        });

        return await this._process.init();
    }

    public connect(ip: string, port: number): void {
        this._process.connect(ip, port);

        console.log("Cliente " + this._id + " conectado a " + ip + ":" + port);
    }

    public close(): void {
        this._process.close();
    }

    public epToBroadcast(msg: Message): void {
        this._process.epToBroadcast(msg);
    }
}

if(typeof module !== 'undefined' && !module.parent) {

    if(process.argv.length != 5) {
        console.log("Use: ts-node client.ts <id> <ip> <port>");
        process.exit();
    }

    const id: string = process.argv[2];
    const ip: string = process.argv[3];
    const port: number = parseInt(process.argv[4]);

    const client = new Client(id, ip, port);

    client.init()
    .then(() => {

        client.on('message', (event: Event) => {
            console.log(event.sourceId + "(" + event.id +  ") > " + event.msg.data);
        });

        var stdin = process.openStdin();
        stdin.addListener("data", function(d) {
            var cmd: string = d.toString().trim();

            var args = cmd.split(":");
            
            if(args.length == 3 && args[0] == "connect") {
                client.connect(args[1], parseInt(args[2]));
            } else {
                client.epToBroadcast(new Message(cmd));
            }
        });

    })
    .catch((error: any) => {
        console.log("Error al iniciar cliente " + id);
        console.log(error);
        process.exit();
    });
    
    // Escucha la señal CTRL + C y cierra el programa correctamente
    process.on('SIGINT', function() {
        client.close();
        process.exit();
    });
}
