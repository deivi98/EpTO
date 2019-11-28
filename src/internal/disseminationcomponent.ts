import Process from './process';
import Event from './event';
import Clock from './clock';
import { Dealer } from "zeromq";
import PSS from './pss';
import Ball from './ball';

export default class DisseminationComponent {

    private _process: Process;
    private static K: number = 5;
    public static TTL: number = 64;
    private _nextBall: { [id: string]: Event; };
    private _peers: Dealer[];

    private _nextRoundInterval: NodeJS.Timeout;

    constructor(process: Process) {
        this._process = process;
        this._nextBall = {};
        this._peers = [];
    }

    get peers(): Dealer[] {
        return this._peers;
    }

    public epToBroadcast(event: Event): void {
        event.ts = Clock.getTime();
        event.ttl = 0;
        event.sourceId = this._process.id;
        this._nextBall[event.id] = event;
    }

    public recieveBall(ball: Ball): void {
        
        ball.events.forEach((event: Event) => {
            if(event.ttl < DisseminationComponent.TTL) {
                
                const localEvent: Event = this._nextBall[event.id];

                if(localEvent) {
                    if(localEvent.ttl < event.ttl) {
                        localEvent.ttl = event.ttl;
                    }
                } else {
                    this._nextBall[event.id] = event;
                }
            }
            // updateClock(event.ts)
        });
    }

    public startFirstRound(): void {
        this._nextRoundInterval = setInterval(this.nextRound, 500, this);
    }

    public endRounds(): void {
        clearInterval(this._nextRoundInterval);
    }

    public nextRound(context: DisseminationComponent): void {
        Object.keys(context._nextBall).forEach((id: string) => {
            context._nextBall[id].ttl++;
        });

        const events: Event[] = Object.values(context._nextBall);

        if(events.length > 0) {
            const selectedPeers: Dealer[] = PSS.sample(context._peers, DisseminationComponent.K);

            const ball = new Ball(events);
            selectedPeers.forEach((peer: Dealer) => {
                console.log("SEND: " + ball.serialize());
                peer.send(ball.serialize());
            });
        }

        context._process.orderingComponent.orderEvents(events);
        context._nextBall = {};
    }
}