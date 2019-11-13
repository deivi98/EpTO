import Message from '../app/message';

export default class Event {

    private _id: number;
    private _sourceId: string;
    private _ttl: number;
    private _ts: number;
    private _msg: Message;

    constructor(id: number, sourceId: string, ttl: number, ts: number, msg: Message) {
        this._id = id;
        this._sourceId = sourceId;
        this._ttl = ttl;
        this._ts = ts;
        this._msg = msg;
    }

    get id(): number {
        return this._id;
    }

    get sourceId(): string {
        return this._sourceId;
    }

    get ttl(): number {
        return this._ttl;
    }

    set ttl(ttl: number) {
        this._ttl = ttl;
    }

    get ts(): number {
        return this._ts;
    }

    get msg(): Message {
        return this._msg;
    }
}
