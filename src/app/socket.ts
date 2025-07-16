import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  constructor() {
    // Başlangıçta bağlantı yapılmaz
  }

  // ⬇️ Token ile bağlantı kurulmasını sağlayan fonksiyon
  connect(token: string): void {
    this.socket = io('http://192.168.137.247:3000', {
      auth: {
        token: token
      }
    });
  }

  sendMessage(data: any): void {
    if (this.socket) {
      this.socket.emit('message', data);
    } else {
      console.warn('Socket bağlantısı yok. Mesaj gönderilemedi.');
    }
  }

  sendTyping(data: any): void {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  onMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  onTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  onTotalClients(callback: (data: number) => void): void {
    if (this.socket) {
      this.socket.on('clients-total', callback);
    }
  }
}
