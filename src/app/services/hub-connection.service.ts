import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpTransportType, HubConnection, LogLevel } from '@microsoft/signalr';
import { Subscription } from 'rxjs';
import { CommunicationService } from './communication.service';
import {ToolsService} from "./tools.service";
import {environment} from "../../environments/environment";
import {ClientStorageService} from "./client-storage.service";

@Injectable({
  providedIn: 'root',
})
export class HubConnectionService implements OnDestroy, OnInit {
  public async: any;
  message = '';
  inDebounce = null;
  subscriptions: Subscription = new Subscription();
  public connectionIsEstablished = false;
  isDebug = false;
  userId = null;
  debouncePropertiesUpdated = [];
  debouncePropertyUpdateFunction = null;
  private hubConnection: HubConnection;
  private apiUrl = environment.hubConnectionUrl + 'messages/';

  constructor(
    protected http: HttpClient,
    private communicationService: CommunicationService,
    private clientStorageService: ClientStorageService,
    private toolsService: ToolsService,
  ) {
    // delay to avoid congestion on the server when the page loads
    setTimeout(() => {
      this.initHubConnection();
    }, 2000);

  }

  ngOnInit(): void {
  }

  initHubConnection() {
    // console.log('init');
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  RequestUsersConnected() {
    this.SendMessage({ requester: this.clientStorageService.getUserId() }, 'reportConnectedUsers').subscribe();
  }

  SendChatMessage(message: any) {
    this.SendMessage(
      {
        message,
      },
      'ChatMessageReceived',
    ).subscribe();
  }

  SendChatMessageRead(message: any) {
    this.SendMessage(message, 'ChatMessageRead').subscribe();
  }

  SendChatMessageTyping(message: any) {
    this.SendMessage(message, 'ChatMessageTyping').subscribe();
  }

  SendTestSignalR(data = null, type = 'Test') {
    this.SendMessage(data, type).subscribe();
  }


  private createConnection() {
    this.hubConnection = null;
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(environment.hubConnectionUrl, {
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
    })
    .configureLogging(LogLevel.Debug)
    .build();
    this.hubConnection.serverTimeoutInMilliseconds = 120000;
  }

  private startConnection(): void {

    if (!this.connectionIsEstablished) {
      this.hubConnection
      .start()
      .then(() => {
        this.connectionIsEstablished = true;
        const actualDate = new Date();
        console.warn(
          `-------Connection successfully established with LeapXL server through SignalR ${ actualDate.getHours() }:${ actualDate.getMinutes() }:${ actualDate.getSeconds() }-------`,
        );
      })
      .catch((err: any) => {
        console.log('Error while establishing connection, retrying...');
      });

      this.hubConnection.onclose(() => {
        // console.log('signalr disconected');
        this.connectionIsEstablished = false;
      });
    }
  }

  private registerOnServerEvents(): void {
    this.hubConnection.on('Send', (data: HubConnectionDto) => {
      if (this.isDebug) {
        console.warn('Realtime connection Data received:', data);
      }
      this.eventHandler(data);
    });
  }

  private eventHandler(message: HubConnectionDto) {

    switch (message.type) {

      case 'ChatMessageReceived':
        if (
          message.data.message.chatMessageHistory.sender.id !== this.clientStorageService.getUserId() &&
          message.data.message.receptorId === this.clientStorageService.getUserId()
        ) {
          this.communicationService.Event.System.Chat.$ReceiveMessage.emit(message.data);
        }
        break;

      case 'ChatMessageRead':
        if (message.data.senderId !== this.clientStorageService.getUserId() && message.data.receptorId === this.clientStorageService.getUserId()) {
          this.communicationService.Event.System.Chat.$MessagesRead.emit(message.data);
        }
        break;

      case 'ChatMessageTyping':
        if (message.data.senderId !== this.clientStorageService.getUserId() && message.data.receptorId === this.clientStorageService.getUserId()) {
          this.communicationService.Event.System.Chat.$MessagesTyping.emit(message.data);
        }
        break;

      default:
        break;
    }
  }

  private SendMessage(data: any, type: string) {
    return this.http.post(this.apiUrl + 'send', {
      data: data,
      type: type,
      url: '',
      icon: '',
      description: '',
    });
  }
}
