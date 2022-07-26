import { UserStatus } from 'src/enums/games.enum';
import { ChatUser } from './chat-user.class';

export class ChatUsers {
  private users: Array<ChatUser> = new Array();

  constructor(private maxUser: number = Infinity) {}

  addUser(user: ChatUser) {
    if (this.users.length !== this.maxUser) {
      this.users.push(user);
    }
  }

  removeUser(user: ChatUser) {
    const userIndex: number = this.users.findIndex((chatUser) => chatUser.socketId === user.socketId);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
    }
  }

  getUser(socketId: string): ChatUser | undefined {
    const user: ChatUser = this.users.find((user) => user.socketId === socketId);
    return user;
  }

  getUserById(userId: string): ChatUser | undefined {
    const user: ChatUser = this.users.find((user) => user.id === parseInt(userId));
    return user;
  }

  changeUserStatus(socketId: string, status: UserStatus) {
    let user: ChatUser = this.getUser(socketId);

    user.setUserStatus(status);
  }

  addRoomToUser(socketId: string, roomId: string) {
    const chatUser = this.getUser(socketId);

    if (chatUser) {
      chatUser.addRoom(roomId);
    }
  }

  removeRoomFromUser(socketId: string, roomId: string) {
    const chatUser = this.getUser(socketId);

    if (chatUser) {
      chatUser.removeRoom(roomId);
    }
  }
}
