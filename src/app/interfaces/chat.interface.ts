export interface IChat {
  open: boolean;
  rooms: IChatRoom[];
  usersAvailable: {
    color: string,
    name: string,
    unreadMessages: number,
    initials: string,
    email: string,
    id: number
  }[];
}

export interface IChatMessageHistory {
  messageId: string;
  message: string;
  timestamp: string;
  type: string;
  read: boolean;
  size: string;
  format: string;
  icon: string;
  action: string;
  modified: boolean;
  actionMessage: IChatMessageHistory;
  sender: {
    color: string,
    userLogged: boolean,
    name: string,
    initials: string,
    id: number
  };
}

export interface IChatRoom {
  active: boolean;
  id: string;
  name: string;
  unreadMessages: number;
  history?: IChatMessageHistory[];
  typing: boolean;
  users?: {
    color: string,
    name: string,
    email: string,
    initials: string,
    id: number
  }[];
}
