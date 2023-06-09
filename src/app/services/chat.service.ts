import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { debounce } from 'lodash-es';
import { Subscription } from 'rxjs';
import { ClientStorageService } from './client-storage.service';
import { ToolsService } from './tools.service';
import {IChat, IChatMessageHistory, IChatRoom} from "../interfaces/chat.interface";
import {CommunicationService} from "./communication.service";
import {HubConnectionService} from "./hub-connection.service";

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  chat: IChat = {
    open: false,
    rooms: [],
    usersAvailable: [],
  };
  senderInitials = '';
  senderColor = '';
  chatMinimized = true;
  readIndicatorEnabled = true;
  $ReceiveActiveRoomMessage = new EventEmitter<boolean | null>();
  $ReceiveMessage = new EventEmitter<any>();
  $Typing = new EventEmitter<boolean | null>();
  typingStopped = debounce(() => {
    const activeRoom = this.GetActiveRoom();

    if(activeRoom)
      activeRoom.typing = false;

  }, 1200);
  private subscriptions: Subscription;

  constructor(
    private toolsService: ToolsService,
    private hubConnectionService: HubConnectionService,
    private communicationService: CommunicationService,
    private clientStorageService: ClientStorageService
  ) {
    if (clientStorageService.getUserFullName()) {
      setTimeout(() => {
        if (clientStorageService.getUserFullName()) {
          this.senderInitials = clientStorageService
            .getUserFullName()
            .split(' ')
            .map((n: string, i: number, a: string) => (i === 0 || i + 1 === a.length ? n[0] : null))
            .join('');
        }
      }, 300);
    }

    this.subscriptions = communicationService.Event.System.Chat.$ReceiveMessage.subscribe(data => {
      console.log('=event=');
      this.ReceiveMessage(data.message.chatMessageHistory, data.message.roomId);
    });

    this.subscriptions.add(
      communicationService.Event.System.Chat.$MessagesRead.subscribe(data => {
        console.log('=event=');
        if (this.readIndicatorEnabled) {
          this.MyMessagesRead(data);
        }
      })
    );

    this.subscriptions.add(
      communicationService.Event.System.Chat.$MessagesTyping.subscribe(data => {
        console.log('=event=');
        this.MessageTyping(data);
      })
    );

    this.senderColor = this.toolsService.GetRandomColorHEX();
  }

  get UnreadMessages(): number {
    return this.chat.usersAvailable.map(u => u.unreadMessages).reduce((a, b) => a + b, 0);
  }

  GetActiveRoom() {
    return this.chat.rooms.find(r => r.active);
  }

  FindAvailableUser(userId: number) {
    return this.chat.usersAvailable.find(ua => ua.id === userId);
  }

  AddUser(user: any) {
    if (this.FindAvailableUser(user.userId)) {
      // already added
    } else {
      this.chat.usersAvailable.push({
        color: this.toolsService.GetRandomColorHEX(),
        name: user.userFullName,
        unreadMessages: 0,
        initials: user.userFullName
          .split(' ')
          .map((n: string, i: number, a: string) => (i === 0 || i + 1 === a.length ? n[0] : null))
          .join(''),
        email: user.userName,
        id: user.userId,
      });
    }
  }

  MessageTyping(data: any) {
    this.MarkRoomAsTyping(data.senderId.toString());
  }

  MarkRoomAsTyping(roomId: string) {
    const activeRoom = this.GetActiveRoom();
    if (activeRoom && activeRoom.id === roomId) {
      const room = this.GetRoom(roomId);

      if (room) {
        room.typing = true;
        this.$Typing.emit(null);
        this.typingStopped();
      }
    }
  }

  RequestUsers() {
    this.hubConnectionService.RequestUsersConnected();
  }

  InitChat() {
    this.chat = {
      open: false,
      rooms: [],
      usersAvailable: [],
    };
    this.RequestUsers();
  }

  ReceiveMessage(chatMessageHistory: IChatMessageHistory, roomId: string) {
    this.AddReceivedMessageToRoom(roomId, chatMessageHistory, true);
  }

  SendMessage(message: string, action = 'message', messageFocused: IChatMessageHistory, type = 'string', format = '', icon = '', size = '') {
    const roomId = `${this.clientStorageService.getUserId()}`;
    const chatMessageHistory = {
      messageId: this.toolsService.GenerateGuid(),
      message,
      timestamp: new Date().toLocaleTimeString(),
      read: false,
      type,
      size,
      format,
      icon,
      action,
      modified: action === 'edit',
      actionMessage: messageFocused,
      sender: {
        userLogged: true,
        email: this.clientStorageService.getUserName(),
        name: this.clientStorageService.getUserFullName(),
        initials: this.senderInitials,
        color: this.senderColor,
        id: this.clientStorageService.getUserId(),
      },
    };

    const activeRoom = this.GetActiveRoom();

    if(activeRoom && activeRoom.users) {
      this.hubConnectionService.SendChatMessage({
        chatMessageHistory,
        roomId: roomId,
        receptorId: activeRoom.users.length > 0 ? activeRoom.users[0].id : 0,
      });

      switch (action) {
        case 'edit':
          this.EditMessage(activeRoom.id, chatMessageHistory);
          break;
        case 'delete':
          this.DeleteMessage(activeRoom.id, chatMessageHistory);
          break;
        default:
          activeRoom.history?.push(chatMessageHistory);
          break;
      }
    }
  }

  DeleteMessage(roomId: string, message: IChatMessageHistory) {
    const room = this.GetRoom(roomId);

    if (room) {
      room.history = room.history?.filter(m => m.messageId !== message.actionMessage.messageId);
    }
  }

  EditMessage(roomId: string, message: IChatMessageHistory) {
    const room = this.GetRoom(roomId);

    if (room) {
      const originalMessage = room.history?.find(m => m.messageId === message.actionMessage.messageId);

      if (originalMessage) {
        originalMessage.message = message.message;
        originalMessage.modified = true;
      }
    }
  }

  SendChatMessageRead(roomId: string, receptorId: number, senderId: number) {
    if (this.readIndicatorEnabled) {
      this.hubConnectionService.SendChatMessageRead({
        roomId: roomId,
        receptorId,
        senderId,
      });
    }
  }

  SendChatMessageTyping(roomId: string, receptorId: number, senderId: number) {
    this.hubConnectionService.SendChatMessageTyping({
      roomId: roomId,
      receptorId,
      senderId,
    });
  }

  ClearRoom(roomId: string) {
    const room = this.GetRoom(roomId);

    if (room) {
      room.history = [];
    }
  }

  AddReceivedMessageToRoom(roomId: string, messageHistory: IChatMessageHistory, received = false) {
    const room = this.GetRoom(roomId);
    const user = this.FindAvailableUser(messageHistory.sender.id);

    switch (messageHistory.action) {
      case 'edit':
        this.EditMessage(roomId, messageHistory);
        break;
      case 'delete':
        this.DeleteMessage(roomId, messageHistory);
        break;
      default:
        if (room && room.active && !this.chatMinimized) {
          if (received) {
            this.$ReceiveActiveRoomMessage.emit(null);
            this.SendChatMessageRead(room.id, room.users[0].id, this.clientStorageService.getUserId());
          }
        } else if (user) {
          user.unreadMessages = user.unreadMessages + 1;
          if (received) {
            this.$ReceiveMessage.emit(messageHistory);
          }
        }

        if (room) {
          room.history?.push(messageHistory);
          room.typing = false;
          if (!room.active || this.chatMinimized) {
            room.unreadMessages = room.unreadMessages + 1;
          }
        } else {
          this.AddNewRoom(messageHistory.sender, false, messageHistory);
        }
        break;
    }
  }

  MyMessagesRead(data: any) {
    this.MarkMyMessagesAsRead(data.senderId.toString());
  }

  MarkMyMessagesAsRead(roomId: string) {
    const room = this.GetRoom(roomId);
    if (room) {
      room.history?.forEach(h => (h.read = true));
    }
  }

  DisableActiveRoom() {
    const activeRoom = this.GetActiveRoom();
    if (activeRoom) {
      activeRoom.active = false;
    }
  }

  GetRoom(roomId: string) {
    return this.chat.rooms.find(r => r.id === roomId);
  }

  OpenRoom(roomId: string, user: any) {
    this.DisableActiveRoom();
    const room = this.GetRoom(roomId);
    this.MarkMessagesAsRead(null, user.id);

    if (room) {
      room.active = true;
      this.MarkMessagesAsRead(roomId);
    } else {
      this.AddNewRoom(user);
    }
  }

  MarkAllMessageAsRead() {
    this.chat.rooms.forEach(r => this.MarkMessagesAsRead(r.id));
    this.chat.usersAvailable.forEach(u => this.MarkMessagesAsRead(null, u.id));
  }

  MarkMessagesAsRead(roomId: string | null, userId?: number | null) {
    const room = this.GetRoom(roomId || '');
    const userAvailable = this.FindAvailableUser(userId || 0);

    if (room) {
      room.unreadMessages = 0;
      this.SendChatMessageRead(room.id, room.users[0].id, this.clientStorageService.getUserId());

      room.users
        .map(u => u.id)
        .forEach(userAvailableId => {
          this.MarkMessagesAsRead(null, userAvailableId);
        });
    }

    if (userAvailable) {
      userAvailable.unreadMessages = 0;
    }
  }

  AddNewRoom(user: any, active = true, message?: IChatMessageHistory): IChatRoom {
    const roomId = `${user.id}`;

    let room = this.GetRoom(roomId);

    if (room) {
    } else {
      room = {
        active: active,
        id: roomId,
        name: user.name,
        typing: false,
        unreadMessages: message ? 1 : 0,
        history: message ? [message] : [],
        users: [
          {
            color: user.color,
            name: user.name,
            initials: user.initials,
            email: user.email,
            id: user.id,
          },
        ],
      };

      this.chat.rooms.push(room);
    }
    return room;
  }

  ToggleReadIndicator() {
    this.readIndicatorEnabled = !this.readIndicatorEnabled;
  }

  OpenChat() {
    this.chat.open = true;
    this.RequestUsers();
  }

  CloseChat() {
    this.chat.open = false;
  }

  DestroyChat() {
    this.InitChat();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
