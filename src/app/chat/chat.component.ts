import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounce } from 'lodash-es';
import { FileUploader } from 'ng2-file-upload';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Subscription } from 'rxjs/internal/Subscription';
import {IChatMessageHistory} from "../interfaces/chat.interface";
import {ChatService} from "../services/chat.service";
import {ClientStorageService} from "../services/client-storage.service";
import {ToolsService} from "../services/tools.service";
import {CommunicationService} from "../services/communication.service";
import {BrowserNotificationsService} from "../services/browser-notifications.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger('messageRemoved', [
      transition(':leave', [style({ opacity: 1, transform: 'scale(1)' }), animate('200ms', style({ opacity: 0, transform: 'scale(0.3)' }))]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50%)' }),
        animate('150ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('200ms', style({ opacity: 0, transform: 'translateY(50%)' })),
      ]),
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50%)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('300ms', style({ opacity: 0, transform: 'translateY(-50%)' })),
      ]),
    ]),
    trigger('slideDownChatSettings', [
      transition(':enter', [style({ opacity: 0, height: '0px' }), animate('200ms', style({ opacity: 1, height: '45px' }))]),
      transition(':leave', [style({ opacity: 1, height: '45px' }), animate('300ms', style({ opacity: 0, height: '0px' }))]),
    ]),
    trigger('bubble', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50%) scale(0.7)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('300ms', style({ opacity: 0, transform: 'translateY(100%)' })),
      ]),
    ]),
    trigger('zoom', [
      transition(':enter', [style({ transform: 'scale(0.5)' }), animate('200ms', style({ transform: 'scale(1)' }))]),
      transition(':leave', [style({ transform: 'scale(1)' }), animate('300ms', style({ transform: 'scale(0.2)' }))]),
    ]),
    trigger('userAvailable', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20%) scale(0.9)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('300ms', style({ opacity: 0, transform: 'translateY(100%)' })),
      ]),
    ]),
    trigger('chatview', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(100%)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('300ms', style({ opacity: 0, transform: 'translateY(100%)' })),
      ]),
    ]),
    trigger('friendslist', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('messageInput', { static: false })
  sendMessageInput: ElementRef;
  displayUsersList = true;
  today = new Date().toDateString();
  userId = 0;
  chatMuted = false;
  minimized = false;
  typingInterval: NodeJS.Timer | null = null;
  messageFocused: IChatMessageHistory | null = null;
  messageFocusedAction = '';
  emojiPickerOpen = false;
  chatSettingsOpen = false;
  // region EMOJIS
  emojis = [
    '😀',
    '😁',
    '😂',
    '😃',
    '😄',
    '😅',
    '😆',
    '😇',
    '😈',
    '👿',
    '😉',
    '😊',
    '😋',
    '😌',
    '😍',
    '😎',
    '😏',
    '😐',
    '😑',
    '😒',
    '😓',
    '😔',
    '😕',
    '😖',
    '😗',
    '😘',
    '😙',
    '😚',
    '😛',
    '😜',
    '😝',
    '😞',
    '😟',
    '😠',
    '😡',
    '😢',
    '😣',
    '😤',
    '😥',
    '😦',
    '😧',
    '😨',
    '😩',
    '😪',
    '😫',
    '😬',
    '😭',
    '😮',
    '😯',
    '😰',
    '😱',
    '😲',
    '😳',
    '😴',
    '😵',
    '😶',
    '😷',
    '😸',
    '😹',
    '😺',
    '😻',
    '😼',
    '😽',
    '😾',
    '😿',
    '🙀',
    '👣',
    '👤',
    '👥',
    '👶',
    '👶🏻',
    '👶🏼',
    '👶🏽',
    '👶🏾',
    '👶🏿',
    '👦',
    '👦🏻',
    '👦🏼',
    '👦🏽',
    '👦🏾',
    '👦🏿',
    '👧',
    '👧🏻',
    '👧🏼',
    '👧🏽',
    '👧🏾',
    '👧🏿',
    '👨',
    '👨🏻',
    '👨🏼',
    '👨🏽',
    '👨🏾',
    '👨🏿',
    '👩',
    '👩🏻',
    '👩🏼',
    '👩🏽',
    '👩🏾',
    '👩🏿',
    '👫',
    '👬',
    '👭',
    '👯',
    '👰',
    '👰🏻',
    '👰🏼',
    '👰🏽',
    '👰🏾',
    '👰🏿',
    '👱',
    '👱🏻',
    '👱🏼',
    '👱🏽',
    '👱🏾',
    '👱🏿',
    '👲',
    '👲🏻',
    '👲🏼',
    '👲🏽',
    '👲🏾',
    '👲🏿',
    '👳',
    '👳🏻',
    '👳🏼',
    '👳🏽',
    '👳🏾',
    '👳🏿',
    '👴',
    '👴🏻',
    '👴🏼',
    '👴🏽',
    '👴🏾',
    '👴🏿',
    '👵',
    '👵🏻',
    '👵🏼',
    '👵🏽',
    '👵🏾',
    '👵🏿',
    '👮',
    '👮🏻',
    '👮🏼',
    '👮🏽',
    '👮🏾',
    '👮🏿',
    '👷',
    '👷🏻',
    '👷🏼',
    '👷🏽',
    '👷🏾',
    '👷🏿',
    '👸',
    '👸🏻',
    '👸🏼',
    '👸🏽',
    '👸🏾',
    '👸🏿',
    '💂',
    '💂🏻',
    '💂🏼',
    '💂🏽',
    '💂🏾',
    '💂🏿',
    '👼',
    '👼🏻',
    '👼🏼',
    '👼🏽',
    '👼🏾',
    '👼🏿',
    '🎅',
    '🎅🏻',
    '🎅🏼',
    '🎅🏽',
    '🎅🏾',
    '🎅🏿',
    '👻',
    '👹',
    '👺',
    '💩',
    '💀',
    '👽',
    '👾',
    '🙇',
    '🙇🏻',
    '🙇🏼',
    '🙇🏽',
    '🙇🏾',
    '🙇🏿',
    '💁',
    '💁🏻',
    '💁🏼',
    '💁🏽',
    '💁🏾',
    '💁🏿',
    '🙅',
    '🙅🏻',
    '🙅🏼',
    '🙅🏽',
    '🙅🏾',
    '🙅🏿',
    '🙆',
    '🙆🏻',
    '🙆🏼',
    '🙆🏽',
    '🙆🏾',
    '🙆🏿',
    '🙋',
    '🙋🏻',
    '🙋🏼',
    '🙋🏽',
    '🙋🏾',
    '🙋🏿',
    '🙎',
    '🙎🏻',
    '🙎🏼',
    '🙎🏽',
    '🙎🏾',
    '🙎🏿',
    '🙍',
    '🙍🏻',
    '🙍🏼',
    '🙍🏽',
    '🙍🏾',
    '🙍🏿',
    '💆',
    '💆🏻',
    '💆🏼',
    '💆🏽',
    '💆🏾',
    '💆🏿',
    '💇',
    '💇🏻',
    '💇🏼',
    '💇🏽',
    '💇🏾',
    '💇🏿',
    '💑',
    '👩‍❤️‍👩',
    '👨‍❤️‍👨',
    '💏',
    '👩‍❤️‍💋‍👩',
    '👨‍❤️‍💋‍👨',
    '🙌',
    '🙌🏻',
    '🙌🏼',
    '🙌🏽',
    '🙌🏾',
    '🙌🏿',
    '👏',
    '👏🏻',
    '👏🏼',
    '👏🏽',
    '👏🏾',
    '👏🏿',
    '👂',
    '👂🏻',
    '👂🏼',
    '👂🏽',
    '👂🏾',
    '👂🏿',
    '👀',
    '👃',
    '👃🏻',
    '👃🏼',
    '👃🏽',
    '👃🏾',
    '👃🏿',
    '👄',
    '💋',
    '👅',
    '💅',
    '💅🏻',
    '💅🏼',
    '💅🏽',
    '💅🏾',
    '💅🏿',
    '👋',
    '👋🏻',
    '👋🏼',
    '👋🏽',
    '👋🏾',
    '👋🏿',
    '👍',
    '👍🏻',
    '👍🏼',
    '👍🏽',
    '👍🏾',
    '👍🏿',
    '👎',
    '👎🏻',
    '👎🏼',
    '👎🏽',
    '👎🏾',
    '👎🏿',
    '☝',
    '☝🏻',
    '☝🏼',
    '☝🏽',
    '☝🏾',
    '☝🏿',
    '👆',
    '👆🏻',
    '👆🏼',
    '👆🏽',
    '👆🏾',
    '👆🏿',
    '👇',
    '👇🏻',
    '👇🏼',
    '👇🏽',
    '👇🏾',
    '👇🏿',
    '👈',
    '👈🏻',
    '👈🏼',
    '👈🏽',
    '👈🏾',
    '👈🏿',
    '👉',
    '👉🏻',
    '👉🏼',
    '👉🏽',
    '👉🏾',
    '👉🏿',
    '👌',
    '👌🏻',
    '👌🏼',
    '👌🏽',
    '👌🏾',
    '👌🏿',
    '✌',
    '✌🏻',
    '✌🏼',
    '✌🏽',
    '✌🏾',
    '✌🏿',
    '👊',
    '👊🏻',
    '👊🏼',
    '👊🏽',
    '👊🏾',
    '👊🏿',
    '✊',
    '✊🏻',
    '✊🏼',
    '✊🏽',
    '✊🏾',
    '✊🏿',
    '✋',
    '✋🏻',
    '✋🏼',
    '✋🏽',
    '✋🏾',
    '✋🏿',
    '💪',
    '💪🏻',
    '💪🏼',
    '💪🏽',
    '💪🏾',
    '💪🏿',
    '👐',
    '👐🏻',
    '👐🏼',
    '👐🏽',
    '👐🏾',
    '👐🏿',
    '🙏',
    '🙏🏻',
    '🙏🏼',
    '🙏🏽',
    '🙏🏾',
    '🙏🏿',
    '🌱',
    '🌲',
    '🌳',
    '🌴',
    '🌵',
    '🌷',
    '🌸',
    '🌹',
    '🌺',
    '🌻',
    '🌼',
    '💐',
    '🌾',
    '🌿',
    '🍀',
    '🍁',
    '🍂',
    '🍃',
    '🍄',
    '🌰',
    '🐀',
    '🐁',
    '🐭',
    '🐹',
    '🐂',
    '🐃',
    '🐄',
    '🐮',
    '🐅',
    '🐆',
    '🐯',
    '🐇',
    '🐰',
    '🐈',
    '🐱',
    '🐎',
    '🐴',
    '🐏',
    '🐑',
    '🐐',
    '🐓',
    '🐔',
    '🐤',
    '🐣',
    '🐥',
    '🐦',
    '🐧',
    '🐘',
    '🐪',
    '🐫',
    '🐗',
    '🐖',
    '🐷',
    '🐽',
    '🐕',
    '🐩',
    '🐶',
    '🐺',
    '🐻',
    '🐨',
    '🐼',
    '🐵',
    '🙈',
    '🙉',
    '🙊',
    '🐒',
    '🐉',
    '🐲',
    '🐊',
    '🐍',
    '🐢',
    '🐸',
    '🐋',
    '🐳',
    '🐬',
    '🐙',
    '🐟',
    '🐠',
    '🐡',
    '🐚',
    '🐌',
    '🐛',
    '🐜',
    '🐝',
    '🐞',
    '🐾',
    '⚡️',
    '🔥',
    '🌙',
    '☀️',
    '⛅️',
    '☁️',
    '💧',
    '💦',
    '☔️',
    '💨',
    '❄️',
    '🌟',
    '⭐️',
    '🌠',
    '🌄',
    '🌅',
    '🌈',
    '🌊',
    '🌋',
    '🌌',
    '🗻',
    '🗾',
    '🌐',
    '🌍',
    '🌎',
    '🌏',
    '🌑',
    '🌒',
    '🌓',
    '🌔',
    '🌕',
    '🌖',
    '🌗',
    '🌘',
    '🌚',
    '🌝',
    '🌛',
    '🌜',
    '🌞',
    '🍅',
    '🍆',
    '🌽',
    '🍠',
    '🍇',
    '🍈',
    '🍉',
    '🍊',
    '🍋',
    '🍌',
    '🍍',
    '🍎',
    '🍏',
    '🍐',
    '🍑',
    '🍒',
    '🍓',
    '🍔',
    '🍕',
    '🍖',
    '🍗',
    '🍘',
    '🍙',
    '🍚',
    '🍛',
    '🍜',
    '🍝',
    '🍞',
    '🍟',
    '🍡',
    '🍢',
    '🍣',
    '🍤',
    '🍥',
    '🍦',
    '🍧',
    '🍨',
    '🍩',
    '🍪',
    '🍫',
    '🍬',
    '🍭',
    '🍮',
    '🍯',
    '🍰',
    '🍱',
    '🍲',
    '🍳',
    '🍴',
    '🍵',
    '☕️',
    '🍶',
    '🍷',
    '🍸',
    '🍹',
    '🍺',
    '🍻',
    '🍼',
    '🎀',
    '🎁',
    '🎂',
    '🎃',
    '🎄',
    '🎋',
    '🎍',
    '🎑',
    '🎆',
    '🎇',
    '🎉',
    '🎊',
    '🎈',
    '💫',
    '✨',
    '💥',
    '🎓',
    '👑',
    '🎎',
    '🎏',
    '🎐',
    '🎌',
    '🏮',
    '💍',
    '❤️',
    '💔',
    '💌',
    '💕',
    '💞',
    '💓',
    '💗',
    '💖',
    '💘',
    '💝',
    '💟',
    '💜',
    '💛',
    '💚',
    '💙',
    '🏃',
    '🏃🏻',
    '🏃🏼',
    '🏃🏽',
    '🏃🏾',
    '🏃🏿',
    '🚶',
    '🚶🏻',
    '🚶🏼',
    '🚶🏽',
    '🚶🏾',
    '🚶🏿',
    '💃',
    '💃🏻',
    '💃🏼',
    '💃🏽',
    '💃🏾',
    '💃🏿',
    '🚣',
    '🚣🏻',
    '🚣🏼',
    '🚣🏽',
    '🚣🏾',
    '🚣🏿',
    '🏊',
    '🏊🏻',
    '🏊🏼',
    '🏊🏽',
    '🏊🏾',
    '🏊🏿',
    '🏄',
    '🏄🏻',
    '🏄🏼',
    '🏄🏽',
    '🏄🏾',
    '🏄🏿',
    '🛀',
    '🛀🏻',
    '🛀🏼',
    '🛀🏽',
    '🛀🏾',
    '🛀🏿',
    '🏂',
    '🎿',
    '⛄️',
    '🚴',
    '🚴🏻',
    '🚴🏼',
    '🚴🏽',
    '🚴🏾',
    '🚴🏿',
    '🚵',
    '🚵🏻',
    '🚵🏼',
    '🚵🏽',
    '🚵🏾',
    '🚵🏿',
    '🏇',
    '🏇🏻',
    '🏇🏼',
    '🏇🏽',
    '🏇🏾',
    '🏇🏿',
    '⛺️',
    '🎣',
    '⚽️',
    '🏀',
    '🏈',
    '⚾️',
    '🎾',
    '🏉',
    '⛳️',
    '🏆',
    '🎽',
    '🏁',
    '🎹',
    '🎸',
    '🎻',
    '🎷',
    '🎺',
    '🎵',
    '🎶',
    '🎼',
    '🎧',
    '🎤',
    '🎭',
    '🎫',
    '🎩',
    '🎪',
    '🎬',
    '🎨',
    '🎯',
    '🎱',
    '🎳',
    '🎰',
    '🎲',
    '🎮',
    '🎴',
    '🃏',
    '🀄️',
    '🎠',
    '🎡',
    '🎢',
    '🚃',
    '🚞',
    '🚂',
    '🚋',
    '🚝',
    '🚄',
    '🚅',
    '🚆',
    '🚇',
    '🚈',
    '🚉',
    '🚊',
    '🚌',
    '🚍',
    '🚎',
    '🚐',
    '🚑',
    '🚒',
    '🚓',
    '🚔',
    '🚨',
    '🚕',
    '🚖',
    '🚗',
    '🚘',
    '🚙',
    '🚚',
    '🚛',
    '🚜',
    '🚲',
    '🚏',
    '⛽️',
    '🚧',
    '🚦',
    '🚥',
    '🚀',
    '🚁',
    '✈️',
    '💺',
    '⚓️',
    '🚢',
    '🚤',
    '⛵️',
    '🚡',
    '🚠',
    '🚟',
    '🛂',
    '🛃',
    '🛄',
    '🛅',
    '💴',
    '💶',
    '💷',
    '💵',
    '🗽',
    '🗿',
    '🌁',
    '🗼',
    '⛲️',
    '🏰',
    '🏯',
    '🌇',
    '🌆',
    '🌃',
    '🌉',
    '🏠',
    '🏡',
    '🏢',
    '🏬',
    '🏭',
    '🏣',
    '🏤',
    '🏥',
    '🏦',
    '🏨',
    '🏩',
    '💒',
    '⛪️',
    '🏪',
    '🏫',
    '🇦🇺',
    '🇦🇹',
    '🇧🇪',
    '🇧🇷',
    '🇨🇦',
    '🇨🇱',
    '🇨🇳',
    '🇨🇴',
    '🇩🇰',
    '🇫🇮',
    '🇫🇷',
    '🇩🇪',
    '🇭🇰',
    '🇮🇳',
    '🇮🇩',
    '🇮🇪',
    '🇮🇱',
    '🇮🇹',
    '🇯🇵',
    '🇰🇷',
    '🇲🇴',
    '🇲🇾',
    '🇲🇽',
    '🇳🇱',
    '🇳🇿',
    '🇳🇴',
    '🇵🇭',
    '🇵🇱',
    '🇵🇹',
    '🇵🇷',
    '🇷🇺',
    '🇸🇦',
    '🇸🇬',
    '🇿🇦',
    '🇪🇸',
    '🇸🇪',
    '🇨🇭',
    '🇹🇷',
    '🇬🇧',
    '🇺🇸',
    '🇦🇪',
    '🇻🇳',
    '⌚️',
    '📱',
    '📲',
    '💻',
    '⏰',
    '⏳',
    '⌛️',
    '📷',
    '📹',
    '🎥',
    '📺',
    '📻',
    '📟',
    '📞',
    '☎️',
    '📠',
    '💽',
    '💾',
    '💿',
    '📀',
    '📼',
    '🔋',
    '🔌',
    '💡',
    '🔦',
    '📡',
    '💳',
    '💸',
    '💰',
    '💎',
    '🌂',
    '👝',
    '👛',
    '👜',
    '💼',
    '🎒',
    '💄',
    '👓',
    '👒',
    '👡',
    '👠',
    '👢',
    '👞',
    '👟',
    '👙',
    '👗',
    '👘',
    '👚',
    '👕',
    '👔',
    '👖',
    '🚪',
    '🚿',
    '🛁',
    '🚽',
    '💈',
    '💉',
    '💊',
    '🔬',
    '🔭',
    '🔮',
    '🔧',
    '🔪',
    '🔩',
    '🔨',
    '💣',
    '🚬',
    '🔫',
    '🔖',
    '📰',
    '🔑',
    '✉️',
    '📩',
    '📨',
    '📧',
    '📥',
    '📤',
    '📦',
    '📯',
    '📮',
    '📪',
    '📫',
    '📬',
    '📭',
    '📄',
    '📃',
    '📑',
    '📈',
    '📉',
    '📊',
    '📅',
    '📆',
    '🔅',
    '🔆',
    '📜',
    '📋',
    '📖',
    '📓',
    '📔',
    '📒',
    '📕',
    '📗',
    '📘',
    '📙',
    '📚',
    '📇',
    '🔗',
    '📎',
    '📌',
    '✂️',
    '📐',
    '📍',
    '📏',
    '🚩',
    '📁',
    '📂',
    '✒️',
    '✏️',
    '📝',
    '🔏',
    '🔐',
    '🔒',
    '🔓',
    '📣',
    '📢',
    '🔈',
    '🔉',
    '🔊',
    '🔇',
    '💤',
    '🔔',
    '🔕',
    '💭',
    '💬',
    '🚸',
    '🔍',
    '🔎',
    '🚫',
    '⛔️',
    '📛',
    '🚷',
    '🚯',
    '🚳',
    '🚱',
    '📵',
    '🔞',
    '🉑',
    '🉐',
    '💮',
    '㊙️',
    '㊗️',
    '🈴',
    '🈵',
    '🈲',
    '🈶',
    '🈚️',
    '🈸',
    '🈺',
    '🈷',
    '🈹',
    '🈳',
    '🈂',
    '🈁',
    '🈯️',
    '💹',
    '❇️',
    '✳️',
    '❎',
    '✅',
    '✴️',
    '📳',
    '📴',
    '🆚',
    '🅰',
    '🅱',
    '🆎',
    '🆑',
    '🅾',
    '🆘',
    '🆔',
    '🅿️',
    '🚾',
    '🆒',
    '🆓',
    '🆕',
    '🆖',
    '🆗',
    '🆙',
    '🏧',
    '♈️',
    '♉️',
    '♊️',
    '♋️',
    '♌️',
    '♍️',
    '♎️',
    '♏️',
    '♐️',
    '♑️',
    '♒️',
    '♓️',
    '🚻',
    '🚹',
    '🚺',
    '🚼',
    '♿️',
    '🚰',
    '🚭',
    '🚮',
    '▶️',
    '◀️',
    '🔼',
    '🔽',
    '⏩',
    '⏪',
    '⏫',
    '⏬',
    '➡️',
    '⬅️',
    '⬆️',
    '⬇️',
    '↗️',
    '↘️',
    '↙️',
    '↖️',
    '↕️',
    '↔️',
    '🔄',
    '↪️',
    '↩️',
    '⤴️',
    '⤵️',
    '🔀',
    '🔁',
    '🔂',
    '#⃣',
    '0⃣',
    '1⃣',
    '2⃣',
    '3⃣',
    '4⃣',
    '5⃣',
    '6⃣',
    '7⃣',
    '8⃣',
    '9⃣',
    '🔟',
    '🔢',
    '🔤',
    '🔡',
    '🔠',
    'ℹ️',
    '📶',
    '🎦',
    '🔣',
    '➕',
    '➖',
    '〰',
    '➗',
    '✖️',
    '✔️',
    '🔃',
    '™',
    '©',
    '®',
    '💱',
    '💲',
    '➰',
    '➿',
    '〽️',
    '❗️',
    '❓',
    '❕',
    '❔',
    '‼️',
    '⁉️',
    '❌',
    '⭕️',
    '💯',
    '🔚',
    '🔙',
    '🔛',
    '🔝',
    '🔜',
    '🌀',
    'Ⓜ️',
    '⛎',
    '🔯',
    '🔰',
    '🔱',
    '⚠️',
    '♨️',
    '♻️',
    '💢',
    '💠',
    '♠️',
    '♣️',
    '♥️',
    '♦️',
    '☑️',
    '⚪️',
    '⚫️',
    '🔘',
    '🔴',
    '🔵',
    '🔺',
    '🔻',
    '🔸',
    '🔹',
    '🔶',
    '🔷',
    '▪️',
    '▫️',
    '⬛️',
    '⬜️',
    '◼️',
    '◻️',
    '◾️',
    '◽️',
    '🔲',
    '🔳',
    '🕐',
    '🕑',
    '🕒',
    '🕓',
    '🕔',
    '🕕',
    '🕖',
    '🕗',
    '🕘',
    '🕙',
    '🕚',
    '🕛',
    '🕜',
    '🕝',
    '🕞',
    '🕟',
    '🕠',
    '🕡',
    '🕢',
    '🕣',
    '🕤',
    '🕥',
    '🕦',
    '🕧',
  ];
  // endregion
  typingStopped = debounce(() => {
    this.RemoveTypingInterval();
  }, 1000);
  uploader: FileUploader = new FileUploader({});
  private subscriptions: Subscription = new Subscription();

  constructor(
    public chatService: ChatService,
    private clientStorageService: ClientStorageService,
    private toolsService: ToolsService,
    private communicationService: CommunicationService,
    private imageCompress: NgxImageCompressService,
    private browserNotificationsService: BrowserNotificationsService
  ) {
    this.userId = clientStorageService.getUserId();
    chatService.chatMinimized = this.minimized;
  }

  ngOnInit() {
    this.subscriptions = this.communicationService.Event.System.Connection.$ConnectionRecovered.subscribe(online => {
      console.log('=event=');
      this.chatService.RequestUsers();
    });

    this.subscriptions.add(
      this.chatService.$ReceiveMessage.subscribe((message: IChatMessageHistory) => {
        if (!this.chatMuted) {
          this.PlayNotificationMessageAudio();
          this.browserNotificationsService.generateNotification(
            [
              {
                alertContent: `New Message from ${message.sender.name}`,
              },
            ],
            'Chat'
          );

          if (!this.displayUsersList && !this.minimized) {
            // no pulse
          } else {
            this.PulseChat();
          }
        }
      })
    );

    this.subscriptions.add(
      this.chatService.$ReceiveActiveRoomMessage.subscribe(response => {
        if (!this.chatMuted) {
          this.PlayChatMessageAudio();
          if (!this.displayUsersList && !this.minimized) {
            // no pulse
          } else {
            this.PulseChat();
          }
        }
        setTimeout(() => {
          this.ScrollDownChat();
        }, 50);
      })
    );

    this.subscriptions.add(
      this.chatService.$Typing.subscribe(response => {
        setTimeout(() => {
          this.ScrollDownChat();
        }, 20);
      })
    );
  }

  MessageInputEscape() {
    if (this.chatSettingsOpen) {
      this.CloseChatSettings();
    } else if (this.emojiPickerOpen) {
      this.CloseEmojiPicker();
    } else if (this.messageFocused) {
      this.ClearMessageFocused();
    } else {
      this.CloseConversation();
    }
  }

  ToggleChatSettings() {
    if (this.chatSettingsOpen) {
      this.CloseChatSettings();
    } else {
      this.OpenChatSettings();
    }
  }

  OpenChatSettings() {
    this.chatSettingsOpen = true;
  }

  CloseChatSettings() {
    this.chatSettingsOpen = false;
  }

  FocusMessageInput() {
    this.sendMessageInput.nativeElement.focus();
    // this.sendMessageInput.nativeElement.select();
  }

  PlayChatMessageAudio() {
    const chatMessageAudio = new Audio('assets/sounds/chat-message-audio.mp3');
    chatMessageAudio.play();
  }

  PlayNotificationMessageAudio() {
    const notificationMessageAudio = new Audio('assets/sounds/notification-audio.mp3');
    notificationMessageAudio.play();
  }

  RemoveTypingInterval() {
    if(this.typingInterval !== null) {
    clearInterval(this.typingInterval);
    }
    this.typingInterval = null;
  }

  ScrollDownChat() {
    const chatElement = document.querySelector('#chat-messages');
    if (chatElement) {
      chatElement.scrollTop = 999999999999999999999999999999999999;
    }
  }

  FilterUsers(text: string) {
    const friendsElements = document.querySelectorAll('.friend');

    friendsElements.forEach(element => {
      if(element && element.attributes) {

        const nameValue = element.attributes.getNamedItem('name');

        if(nameValue) {
          const name = nameValue.value.toUpperCase().replace(' ', '');

          if (text === '') {
            element.classList.remove('hide');
          } else {
            if (name.indexOf(text.toUpperCase().replace(' ', '')) === -1) {
              element.classList.add('hide');
            } else {
              element.classList.remove('hide');
            }
          }
        }
      }
    });
  }

  MarkAllRead($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    this.chatService.MarkAllMessageAsRead();
  }

  InsertEmoji(emoji: string) {
    console.log();
    this.sendMessageInput.nativeElement.value = this.sendMessageInput.nativeElement.value + ' ' + emoji;
    this.FocusMessageInput();
  }

  ToggleEmojiPicker() {
    if (this.emojiPickerOpen) {
      this.CloseEmojiPicker();
    } else {
      this.OpenEmojiPicker();
      this.FocusMessageInput();
    }
  }

  OpenEmojiPicker() {
    this.emojiPickerOpen = true;
  }

  CloseEmojiPicker() {
    this.emojiPickerOpen = false;
  }

  ReplyMessage(message: IChatMessageHistory) {
    this.messageFocusedAction = 'reply';
    this.messageFocused = message;
    this.FocusMessageInput();
  }

  EditMessage(message: IChatMessageHistory) {
    this.messageFocusedAction = 'edit';
    this.messageFocused = message;
    this.sendMessageInput.nativeElement.value = message.message;
    this.FocusMessageInput();
  }

  DeleteMessage(message: IChatMessageHistory) {
    this.messageFocusedAction = 'delete';
    this.messageFocused = message;
    this.chatService.SendMessage('', this.messageFocusedAction, this.messageFocused);
    this.ClearMessageFocused();
  }

  ClearMessageFocused() {
    this.messageFocused = null;
    this.messageFocusedAction = '';
  }

  Typing($event: KeyboardEvent) {
    if (this.typingInterval) {
      this.typingStopped();
    } else {
      this.typingInterval = setInterval(() => {
        if ($event.keyCode === 13 || $event.keyCode === 27) {
        } else {

          const activeRoom = this.chatService.GetActiveRoom();

          if(activeRoom) {
            this.chatService.SendChatMessageTyping(
              activeRoom.id,
              activeRoom.users?[0].id,
              this.clientStorageService.getUserId()
            );
          }
        }
      }, 1000);
    }
  }

  SendMessage(input: any, type = 'string', format = '', icon = '', size = '0 B') {
    if (type === 'string') {
      if (input.value === '') {
        return;
      }
      this.chatService.SendMessage(input.value, this.messageFocusedAction, this.messageFocused);
      input.value = '';
    } else {
      this.chatService.SendMessage(input, this.messageFocusedAction, this.messageFocused, type, format, icon, size);
    }

    this.RemoveTypingInterval();
    setTimeout(() => {
      this.ScrollDownChat();
    }, 50);
    this.ClearMessageFocused();
    this.CloseEmojiPicker();
  }

  FocusMessage(message: IChatMessageHistory) {
    const id = 'message-' + message.messageId;
    const messageHtmlElement = document.querySelector('#' + id);

    if (messageHtmlElement) {
      messageHtmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  OpenChat(user: any) {
    const roomId = `${user.id}`;
    this.chatService.OpenRoom(roomId, user);
    this.displayUsersList = false;
    setTimeout(() => {
      this.ScrollDownChat();
      setTimeout(() => {
        this.FocusMessageInput();
      }, 200);
    }, 50);
  }

  PulseChat() {
    const chatElement = document.querySelector('#chatbox');
    if (chatElement) {
      chatElement.classList.add('pulse');

      setTimeout(() => {
        chatElement.classList.remove('pulse');
      }, 1500);
    }
  }

  CloseConversation() {
    this.displayUsersList = true;
    this.chatService.DisableActiveRoom();
  }

  RefreshUsers($event: any) {
    $event.preventDefault();
    $event.stopPropagation();

    this.chatService.RequestUsers();
  }

  ToggleNotifications($event: any) {
    $event.preventDefault();
    $event.stopPropagation();

    this.chatMuted = !this.chatMuted;
  }

  Minimize($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    this.minimized = true;
    this.chatService.chatMinimized = true;
  }

  Maximize($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();

    if (this.minimized && !this.displayUsersList && this.chatService.GetActiveRoom()) {
      const activeRoom = this.chatService.GetActiveRoom();

      if(activeRoom)
        this.chatService.MarkMessagesAsRead(activeRoom.id);

    }

    this.minimized = false;
    this.chatService.chatMinimized = false;

    this.ScrollDownChat();
  }

  ClearChat() {
    const activeRoom = this.chatService.GetActiveRoom();

    if(activeRoom)
      this.chatService.ClearRoom(activeRoom.id);
  }

  ToggleReadIndicator($event: MouseEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    this.chatService.ToggleReadIndicator();
  }

  CloseChat($event?: MouseEvent) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    this.displayUsersList = true;
    this.chatService.DisableActiveRoom();
    this.chatService.CloseChat();
  }

  OpenMessageImage(image64: string) {
    const data = image64;
    const w = window.open('about:blank');
    const image = new Image();
    image.src = data;

    if(w) {
      setTimeout(function () {
        w.document.write(image.outerHTML);
      }, 0);
    }
  }

  PasteData(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (items && items.length > 0 && items[0].type.indexOf('image') > -1) {
      this.ClearMessageFocused();
      const blob = items[0].getAsFile();

      if(blob) {
        const reader = new FileReader();
        reader.onload = (blobEvent: any) => {
          this.imageCompress.compressFile(blobEvent.target.result, -1, 70, 30).then(compressedImg => {
            this.SendMessage(compressedImg, 'image', this.GetFileFormat(blob), '', '');
          });
        };
        reader.readAsDataURL(blob);
      }
    }
  }

  SelectFile() {
    const fileSelector = document.getElementById('chatFileSelector');

    if(fileSelector) {
    fileSelector.click();
    }
  }

  FileSelected(eventData: any[]) {
    const file = eventData[0];

    if (file) {
      this.ClearMessageFocused();

      const size = this.toolsService.FormatBytes(file.size);
      const format = this.GetFileFormat(file);
      const icon = this.GetIconForFormat(format);

      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.imageCompress.compressFile(event.target.result, -1, 70, 30).then(compressedImg => {
            // console.log(compressedImg, file.type);
            this.SendMessage(compressedImg, 'image', format, icon, size);
          });
        };
        reader.readAsDataURL(file);
      } else {
        this.SendMessage(file.name, 'file', format, icon, size);
      }
    }
  }

  GetFileFormat(file: File): string {
    const splitName = file.name.split('.').reverse();
    const format = splitName[0];
    return format || 'unknown';
  }

  GetIconForFormat(format: string) {
    const zipIcon = 'storage';
    const videoIcon = 'movie';
    const textIcon = 'description';
    const audioIcon = 'volume_up';
    const exeIcon = 'video_settings';
    const codeIcon = 'code';
    const pdfIcon = 'picture_as_pdf';
    const fileIcon = 'description';
    const discIcon = 'album';
    const dbIcon = 'dns';
    const systemIcon = 'summarize';

    let icon = fileIcon;

    switch (format) {
      case 'rar':
      case 'zip':
      case '7z':
      case 'arj':
      case 'deb':
      case 'pkg':
      case 'rpm':
      case 'gz':
      case 'z':
        icon = zipIcon;
        break;

      case 'aif':
      case 'cda':
      case 'mp3':
      case 'mpa':
      case 'ogg':
      case 'wav':
      case 'wma':
      case 'wpl':
        icon = audioIcon;
        break;

      case 'dmg':
      case 'iso':
      case 'toast':
      case 'vcd':
        icon = discIcon;
        break;

      case 'csv':
      case 'dat':
      case 'db':
      case 'log':
      case 'mdb':
      case 'sav':
      case 'sql':
      case 'tar':
      case 'xml':
        icon = dbIcon;
        break;

      case 'apk':
      case 'bat':
      case 'bin':
      case 'com':
      case 'exe':
      case 'gadget':
      case 'jar':
      case 'msi':
      case 'py':
      case 'wsf':
        icon = exeIcon;
        break;

      case 'doc':
      case 'docx':
      case 'odt':
      case 'rtf':
      case 'tex':
      case 'txt':
      case 'wpd':
        icon = textIcon;
        break;

      case 'pdf':
        icon = pdfIcon;
        break;

      case '3g2':
      case '3gp':
      case 'avi':
      case 'flv':
      case 'h264':
      case 'm4v':
      case 'mkv':
      case 'mov':
      case 'mp4':
      case 'mpg':
      case 'mpeg':
      case 'rm':
      case 'swf':
      case 'vob':
      case 'wmv':
        icon = videoIcon;
        break;

      case 'bak':
      case 'cab':
      case 'cfg':
      case 'cpl':
      case 'dll':
      case 'dmp':
      case 'icns':
      case 'ini':
      case 'sys':
      case 'tmp':
        icon = systemIcon;
        break;

      case 'c':
      case 'class':
      case 'cpp':
      case 'cs':
      case 'java':
      case 'swift':
      case 'vb':
      case 'asp':
      case 'aspx':
      case 'css':
      case 'htm':
      case 'html':
      case 'js':
      case 'php':
      case 'rss':
      case 'xhtml':
        icon = codeIcon;
        break;

      default:
        icon = fileIcon;
        break;
    }

    return icon;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
