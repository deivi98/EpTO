import { Router, Dealer } from "zeromq";
import { EventEmitter } from "events";

class Process extends EventEmitter {

    private _id: string;
    private _ip: string;
    private _port: number;
    private _router: Router;
    private _connections: Dealer[];

    constructor(id: string, ip: string, port: number) {
        super();
        this._id = id;
        this._ip = ip;
        this._port = port;

        this._router = new Router();
        this._connections = [];
    }

    get id(): string {
        return this._id;
    }

    get ip(): string {
        return this._ip;
    }

    get port(): number {
        return this._port;
    }

    public async init(): Promise<void> {

        await this._router.bind("tcp://" + this._ip + ":" + this._port)
        .then(() => {
            console.log("Proceso " + this._id + " escuchando...");
        });

        this.listen();
    }

    private listen(): void {

        var processContext = this;

        this._router.receive().then((buffer) => {
            console.log(this._id + ": Mensaje recibido:");
            console.log(buffer[0].toString());
            console.log(buffer[1].toString());

            processContext.listen();
        });
    }

    public connect(ip: string, port: number) {

        var connectionDealer = new Dealer();
        connectionDealer.connect("tcp://" + ip + ":" + port);
        this._connections.push(connectionDealer);
    }

    public close(): void {

        this._connections.forEach((dealer: Dealer) => {
            dealer.close();
        });

        // this._router.close(); No debería dar error
    }
}

export default Process;