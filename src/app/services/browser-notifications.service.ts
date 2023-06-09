import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrowserNotificationsService {
  public permission: Permission;
  
  constructor() {
    this.permission = this.isSupported() ? 'default' : 'denied';
  }
  
  public isSupported(): boolean {
    return 'Notification' in window;
  }
  
  requestPermission(): void {
    const self = this;
    if ('Notification' in window) {
      Notification.requestPermission(function(status) {
        return (self.permission = status);
      });
    }
  }
  
  generateNotification(source: Array<any>, title = ''): void {
    const self = this;
    source.forEach(item => {
      const options = {
        body: item.alertContent,
        icon: '../../../assets/leap_logo/leap_logo_black.png',
        badge: '../../../assets/leap_logo/leap_logo_black.png',
      };
      const notify = self.create(title !== '' ? `Leap - ${ title }` : 'Leap', options).subscribe();
    });
  }
  
  private create(title: string, options?: PushNotification): any {
    const self = this;
    return new Observable(function(obs) {
      if (!('Notification' in window)) {
        // console.log('Notifications are not available in this environment');
      }
      if (self.permission !== 'granted') {
        // console.log('The user hasn\'t granted you permission to send push notifications');
      }
      const _notify = new Notification(title, options);
      _notify.onshow = function(e) {
        return obs.next({
          notification: _notify,
          event: e,
        });
      };
      _notify.onclick = function(e) {
        return obs.next({
          notification: _notify,
          event: e,
        });
      };
      _notify.onerror = function(e) {
        return obs.error({
          notification: _notify,
          event: e,
        });
      };
      _notify.onclose = function() {
      };
    });
  }
}

export declare type Permission = 'denied' | 'granted' | 'default';

export interface PushNotification {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  renotify?: boolean;
  image?: string;
  silent?: boolean;
  sound?: string;
  noscreen?: boolean;
  sticky?: boolean;
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  vibrate?: number[];
}
