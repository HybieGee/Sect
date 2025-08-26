export class RoomDurableObject {
  private state: DurableObjectState;
  private sessions: Map<WebSocket, string>;
  
  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Map();
  }
  
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const message = await request.json();
      this.broadcast(JSON.stringify(message));
      return new Response('OK');
    }
    
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }
    
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    await this.handleSession(server);
    
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  
  async handleSession(ws: WebSocket): Promise<void> {
    ws.accept();
    
    const sessionId = crypto.randomUUID();
    this.sessions.set(ws, sessionId);
    
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data as string);
        this.handleMessage(ws, data);
      } catch (e) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });
    
    ws.addEventListener('close', () => {
      this.sessions.delete(ws);
    });
    
    ws.addEventListener('error', () => {
      this.sessions.delete(ws);
    });
    
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      timestamp: Date.now()
    }));
  }
  
  handleMessage(ws: WebSocket, data: any): void {
    if (data.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      return;
    }
    
    this.broadcast(JSON.stringify({
      ...data,
      sessionId: this.sessions.get(ws),
      timestamp: Date.now()
    }), ws);
  }
  
  broadcast(message: string, exclude?: WebSocket): void {
    for (const [ws] of this.sessions) {
      if (ws !== exclude && ws.readyState === WebSocket.READY_STATE_OPEN) {
        try {
          ws.send(message);
        } catch (e) {
          this.sessions.delete(ws);
        }
      }
    }
  }
}