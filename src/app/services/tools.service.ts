import { Injectable } from '@angular/core';

@Injectable()
export class ToolsService {

  constructor() {
  }

  public GetRandomColorHEX() {
    return '#' + (Math.random().toString(16) + '000000').substring(2, 8);
  }

  public FormatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  public GenerateGuid() {
    const s:any[] = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 10; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    // tslint:disable-next-line:no-bitwise
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '';
    return s.join('');
  }
}
