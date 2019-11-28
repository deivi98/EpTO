import { Router, Dealer } from "zeromq";
import { EventEmitter } from "events";
import DisseminationComponent from "./disseminationcomponent";
import OrderingComponent from "./orderingcomponent";
import Message from "../app/message";
import Event from "./event";
import Ball from "./ball";

export default class Process extends EventEmitter {

    private static _idInc = 0;
    private static _eventIdInc = 0;
    private _id: string;
    private _ip: string;
    private _port: number;
    private _router: Router;
    private _disseminationComponent: DisseminationComponent;
    private _orderingComponent: OrderingComponent;

    constructor(id: string, ip: string, port: number) {
        super();
        this._id = id;
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

    get orderingComponent(): OrderingComponent {
        return this._orderingComponent;
    }

    public async init(): Promise<void> {

        await this._router.bind("tcp://" + this._ip + ":" + this._port)
        .then(() => {
            console.log("Proceso " + this._id + " escuchando...");
        });

        this.listen();
        this._disseminationComponent.startFirstRound();
    }

    public connect(ip: string, port: number) {

        const connectionDealer: Dealer = new Dealer();
        connectionDealer.connect("tcp://" + ip + ":" + port);
        this._disseminationComponent.peers.push(connectionDealer);
    }

    public close(): void {

        this._disseminationComponent.endRounds();

        this._disseminationComponent.peers.forEach((dealer: Dealer) => {
            dealer.close();
        });

        this._router.close();
    }

    private listen(): void {

        const processContext: Process = this;

        this._router.receive().then((buffer) => {
            console.log(this._id + ": Mensaje recibido:");
            const serializedBall: Object = JSON.parse(buffer[1].toString());

            var ball: Ball = Ball.deserialize(serializedBall);

            console.log(ball);
            this._disseminationComponent.recieveBall(ball);
            processContext.listen();
        });
    }

    public epToBroadcast(msg: Message): void {

        const eventId: string = this._id + "_#" + Process.newEventId();

        const event: Event = new Event(eventId, msg);
        this._disseminationComponent.epToBroadcast(event);
    }

    public static newId(): number {
        return this._idInc++;
    }

    private static newEventId(): number {
        return this._eventIdInc++;
    }
}
