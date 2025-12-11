import { Peer, DataConnection } from "peerjs";
import { P2PMessage } from "../types";

type MessageHandler = (data: P2PMessage) => void;

class P2PService {
  private peer: Peer | null = null;
  private connections: DataConnection[] = [];
  private messageHandlers: MessageHandler[] = [];
  public myId: string | null = null;

  constructor() {
    //
  }

  // Teacher initializes the room
  public async createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Use a random short ID if possible, or let PeerJS generate one
      this.peer = new Peer(this.generateShortId(), {
        debug: 1
      });

      this.peer.on('open', (id) => {
        this.myId = id;
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.connections.push(conn);
        conn.on('data', (data) => this.handleMessage(data as P2PMessage));
        conn.on('close', () => {
          this.connections = this.connections.filter(c => c !== conn);
        });
      });

      this.peer.on('error', (err) => {
        console.error("P2P Error:", err);
        reject(err);
      });
    });
  }

  // Student joins a room
  public async joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer({ debug: 1 });
      
      this.peer.on('open', () => {
        if (!this.peer) return;
        const conn = this.peer.connect(roomId);
        
        conn.on('open', () => {
          this.connections.push(conn);
          resolve();
        });

        conn.on('data', (data) => this.handleMessage(data as P2PMessage));
        conn.on('error', (err) => reject(err));
      });

      this.peer.on('error', (err) => reject(err));
    });
  }

  public sendMessage(msg: P2PMessage) {
    this.connections.forEach(conn => {
      if (conn.open) conn.send(msg);
    });
  }

  public onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
  }

  private handleMessage(data: P2PMessage) {
    this.messageHandlers.forEach(h => h(data));
  }

  private generateShortId() {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  public getPeerCount() {
    return this.connections.length;
  }
}

export const p2pService = new P2PService();
