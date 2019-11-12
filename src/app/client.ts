import Process from '../internal/process';

export default class Client {

    private _id: string;
    private _process: Process;

    constructor(id: string, ip: string, port: number) {
        this._id = id;
        this._process = new Process(id, ip, port);
    }
    
    get id(): string {
        return this._id;
    }

    public async init(): Promise<void> {
        return await this._process.init();
    }

    public connect(ip: string, port: number): void {
        this._process.connect(ip, port);

        console.log("Cliente " + this._id + " conectado a " + ip + ":" + port);
    }

    public close(): void {
        this._process.close();
    }
}
