import Process from './process';
import Event from './event';
import { Dealer } from "zeromq";

export default class DisseminationComponent {

    private _process: Process;
    private static K: number = 5;
    private static TTL: number = 64;
    private _nextBall: Event[];
    private _peers: Dealer[];

    constructor(process: Process) {
        this._process = process;
        this._nextBall = [];
        this._peers = [];
    }

    get peers(): Dealer[] {
        return this._peers;
    }

    public EpTO_broadcast(event: Event): void {
        // TO-DO
    }

    public recieveBall(ball: Event[]): void {
        // TO-DO
    }

    public round(): void {
        // TO-DO
    }
}