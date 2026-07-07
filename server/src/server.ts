// server.ts
import fastify, { FastifyRequest } from 'fastify';
import websocket from '@fastify/websocket';
import { RawData, WebSocket } from 'ws';

const server = fastify({ logger: true });
server.register(websocket);

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

server.get('/ws', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
  socket.on('message', (message: RawData) => {
    socket.send('hi from server');
  });
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
