import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {

  Event = {
    System: {
      Chat: {
        $ReceiveMessage: new EventEmitter<any>(),
        $MessagesRead: new EventEmitter<boolean>(),
        $MessagesTyping: new EventEmitter<boolean>(),
      },
    },
  };

  constructor() {
  }
}

