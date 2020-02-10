import { Dealer } from "zeromq";

/**
 * Clase Connection
 * Guarda la conexion a un nodo
 */
export default class Connection {

    private _ip: string;
    private _port: number;

    /**
     * Construye el objeto conexion 
     * @param ip direccion ip
     * @param port puerto 
     */
    constructor(ip: string, port: number) {
        this._ip = ip;
        this._port = port;
    }

    /**
     * Devuelve un dealer conectado
     */
    public getConnectionDealer(): Dealer {
        const connectionDealer: Dealer = new Dealer();
        connectionDealer.connect("tcp://" + this._ip + ":" + this._port);
        return connectionDealer;
    }

}
