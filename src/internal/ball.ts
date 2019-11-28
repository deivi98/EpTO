import Event from "./event";


export default class Ball {

    private _events: Event[];

    constructor(events: Event[]) {
        this._events = events;
    }

    get events(): Event[] {
        return this._events;
    }

    public serialize(): string {
        return JSON.stringify(this);
    }

    public static deserialize(object: Object): Ball {

        const ball: Ball = Object.assign(new Ball([]), object);

		if(ball.events) {
			for(var i = 0; i < ball.events.length; i++) {
				ball.events[i] = Event.deserialize(ball.events[i]);
			}
		}

        return ball;
    }

}