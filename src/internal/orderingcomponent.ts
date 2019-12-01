import Process from './process';
import Event from './event';
import DisseminationComponent from './disseminationcomponent';

export default class OrderingComponent {

    private _process: Process;
    private _recieved: { [id: string]: Event; };
    private _delivered: { [id: string]: Event; };
    private _lastDeliveredTs: number;

    constructor(process: Process) {
        this._process = process;
        this._recieved = {};
        this._delivered = {};
        this._lastDeliveredTs = 0;
    }

    private isDeliverable(event: Event): boolean {
        return event.ttl > DisseminationComponent.TTL;
    }

    public orderEvents(ball: Event[]): void {

        Object.keys(this._recieved).forEach((id: string) => {
            this._recieved[id].ttl++;
        });

        ball.forEach((event: Event) => {
            if(!this._delivered[event.id] && event.ts >= this._lastDeliveredTs) {

                if(this._recieved[event.id]) {
                    if(this._recieved[event.id].ttl < event.ttl) {
                        this._recieved[event.id].ttl = event.ttl;
                    }
                } else {
                    this._recieved[event.id] = event;
                }
            }
        });

        var minQueuedTs: number = Number.MAX_VALUE;
        var deliverableEvents: Event[] = [];

        Object.keys(this._recieved).forEach((id: string) => {
            const event = this._recieved[id];

            if(this.isDeliverable(event)) {
                deliverableEvents.push(event);
            } else if(event.ts < minQueuedTs) {
                minQueuedTs = event.ts;
            }
        });

        var realDeliverableEvents: Event[] = [];

        deliverableEvents.forEach((event: Event) => {
            if(event.ts <= minQueuedTs) {
                realDeliverableEvents.push(event);
                delete this._recieved[event.id];
            }
        });

        realDeliverableEvents.sort(function(e1: Event, e2: Event): number {
            return (e1.ts - e2.ts) || (e1.sourceId == e2.sourceId ? 0: (e1.sourceId < e2.sourceId ? -1: 1));
        }).forEach((event: Event) => {
            this._delivered[event.id] = event;
            this._lastDeliveredTs = event.ts;
            // ENTREGAR EVENTO
            this._process.emit('message', event);
        });
    }
}