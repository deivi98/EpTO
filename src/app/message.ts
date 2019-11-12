
export default class Message {

    private _data: string;

    constructor(data: string) {
        this._data = data;
    }

    get data(): string {
        return this._data;
    }

}
