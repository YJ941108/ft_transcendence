import { User } from '../../games/class/user.class';

export class ChatUser extends User {
  joinedRooms: string[];

  constructor(id: number, nickname: string, socketId: string) {
    super(id, nickname, socketId);
    this.joinedRooms = [];
  }

  addRoom(roomId: string) {
    const alreadyjoined = !!this.joinedRooms.find((room) => {
      return room === roomId;
    });
    if (!alreadyjoined) {
      this.joinedRooms.push(roomId);
    }
  }

  removeRoom(roomId: string) {
    delete this.joinedRooms[roomId];
  }
}
