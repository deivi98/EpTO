import Process from './process';
import Event from './event';

export default class OrderingComponent {

    private _process: Process;
    private _recieved: Event[];
    private _delivered: Event[];
    private _lastDeliveredTs: number;

    constructor(process: Process) {
        this._process = process;
        this._recieved = [];
        this._delivered = [];
        this._lastDeliveredTs = 0;
    }

    public orderEvents(ball: Event[]): void {
        // TO-DO
    }
}