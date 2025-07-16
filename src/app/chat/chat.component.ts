import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  name: string = '';
  message: string = '';
  messages: any[] = [];
  typingMessage: string = '';
  totalClients: number = 0;
  showPopup: boolean = false;

  constructor(
    private socketService: SocketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      this.showPopup = true;
    }
  }

  loginWithUsername(): void {
    if (!this.name.trim()) return;

    const body = { username: this.name };

    this.http.post<any>('http://192.168.137.247:3000/login', body).subscribe({
      next: (res) => {
        const token = res.token;
        localStorage.setItem('jwt', token);
        console.log('JWT token alındı:', token);

        // Socket bağlantısını başlat
        this.socketService.connect(token);

        // Bağlantı kurulduktan sonra dinleyiciler başlatılır
        this.setupSocketListeners();
      },
      error: (err) => {
        console.error('Login hatası:', err);
      }
    });
  }

  private setupSocketListeners(): void {
    this.socketService.onMessage((data: any) => {
      this.messages.push(data);

      if (data.name !== this.name && Notification.permission === 'granted') {
        new Notification('Yeni Mesaj', {
          body: `${data.name}: ${data.message}`,
          icon: 'assets/chat-icon.png'
        });
      }
    });

    this.socketService.onTyping((data: any) => {
      this.typingMessage = `${data.name} is typing a message`;
      setTimeout(() => (this.typingMessage = ''), 3000);
    });

    this.socketService.onTotalClients((count: number) => {
      this.totalClients = count;
    });
  }

  sendMessage(): void {
    if (!this.message.trim()) return;

    const data = {
      name: this.name,
      message: this.message,
      dateTime: moment().format(),
    };

    this.socketService.sendMessage(data);
    this.messages.push(data);
    this.message = '';
  }

  sendTyping(): void {
    this.socketService.sendTyping({ name: this.name });
  }

  askNotificationPermission(): void {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        this.showPopup = false;
        if (permission === 'granted') {
          alert('Bildirim izni verildi!');
        } else {
          alert('Bildirim izni reddedildi!');
        }
      });
    } else {
      alert('Tarayıcınız bildirimleri desteklemiyor.');
    }
  }

  declinePermission(): void {
    this.showPopup = false;
  }
}
