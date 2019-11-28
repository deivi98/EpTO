import Message from '../app/message';

export default class Event {

    private _id: string;
    private _sourceId: string;
    private _ttl: number;
    private _ts: number;
    private _msg: Message;

    constructor(id: string, msg: Message) {
        this._id = id;
        this._sourceId = undefined;
        this._ttl = undefined;
        this._ts = undefined;
        this._msg = msg;
    }

    get id(): string {
        return this._id;
    }

    get sourceId(): string {
        return this._sourceId;
    }

    set sourceId(sourceId: string) {
        this._sourceId = sourceId;
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

    set ts(ts: number) {
        this._ts = ts;
    }

    get msg(): Message {
        return this._msg;
    }

    public serialize(): string {
        return JSON.stringify(this);
    }

    public static deserialize(object: Object): Event {
		const event: Event = Object.assign(new Event(undefined, undefined), object);
		return event;
	}
}
