import { Router, Dealer } from "zeromq";
import { EventEmitter } from "events";
import DisseminationComponent from "./disseminationcomponent";
import OrderingComponent from "./orderingcomponent";

export default class Process extends EventEmitter {

    private static _idInc = 0;
    private _id: string;
    private _ip: string;
    private _port: number;
    private _router: Router;
    private _disseminationComponent: DisseminationComponent;
    private _orderingComponent: OrderingComponent;

    constructor(ip: string, port: number) {
        super();
        this._id = "p" + Process.newId();
        this._ip = ip;
        this._port = port;
        this._router = new Router();
        this._disseminationComponent = new DisseminationComponent(this);
        this._orderingComponent = new OrderingComponent(this);
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
        this._disseminationComponent.peers.push(connectionDealer);
    }

    public close(): void {

        this._disseminationComponent.peers.forEach((dealer: Dealer) => {
            dealer.close();
        });

        // this._router.close(); No debería dar error
    }

    private static newId(): number {
        return this._idInc++;
    }
}
