
export default class Message {

    private _data: string;

    constructor(data: string) {
        this._data = data;
    }

    get data(): string {
        return this._data;
    }

    public serialize(): string {
        return JSON.stringify(this);
    }

    public static deserialize(object: Object): Message {
        const msg: Message = Object.assign(new Message(undefined), object);
		return msg;
	}
}
