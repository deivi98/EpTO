import Process from '../internal/process';
import Message from './message';
import { EventEmitter } from 'events';

export default class extends EventEmitter {

    private _id: string;
    private _process: Process;

    constructor(id: string, ip: string, port: number) {
        super();
        this._id = id;
        this._process = new Process("p" + Process.newId(), ip, port);
    }
    
    get id(): string {
        return this._id;
    }

    public async init(): Promise<void> {

        this._process.on('message', (msg: Message) => {
            this.emit('message', msg);
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
