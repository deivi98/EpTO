import { Dealer } from 'zeromq';

export default class PSS {

    private static shuffle(peers: Dealer[]): Dealer[] {
        var ctr = peers.length;
        var temp: Dealer;
        var index: number;
    
        while(ctr > 0) {
            index = Math.floor(Math.random() * ctr);
            ctr--;

            temp = peers[ctr];
            peers[ctr] = peers[index];
            peers[index] = temp;
        }

        return peers;
    }

    public static sample(peers: Dealer[], K: number): Dealer[] {

        if(peers.length < K) {
            return peers;
        }

        peers = PSS.shuffle(peers);
        return peers.slice(0, K-1);
    }

}