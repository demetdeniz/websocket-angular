import { Component } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent, HttpClientModule, FormsModule],
  template: `<app-chat></app-chat>`,
})
export class App {}
