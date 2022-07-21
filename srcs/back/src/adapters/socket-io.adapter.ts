import { IoAdapter } from '@nestjs/platform-socket.io';

/**
 * Socket.IO Adapter
 */
export class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);

    return server;
  }
}
