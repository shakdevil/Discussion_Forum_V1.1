import { useState, useEffect, useRef, useCallback } from 'react';

// Define WebSocket event types
export type WebSocketEventType = 'CONNECTED' | 'NEW_QUESTION' | 'NEW_ANSWER' | 'LIKE_ANSWER';

export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
}

export interface WebSocketHook {
  lastEvent: WebSocketEvent | null;
  readyState: number;
  sendMessage: (message: any) => void;
}

export function useWebSocket(): WebSocketHook {
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const socketRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    // Connection opened
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setReadyState(WebSocket.OPEN);
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const parsedEvent = JSON.parse(event.data) as WebSocketEvent;
        console.log('WebSocket event received:', parsedEvent);
        setLastEvent(parsedEvent);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    });
    
    // Connection closed
    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setReadyState(WebSocket.CLOSED);
    });
    
    // Connection error
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setReadyState(WebSocket.CLOSED);
    });
    
    // Cleanup on component unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);
  
  // Function to send messages to the server
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);
  
  return {
    lastEvent,
    readyState,
    sendMessage
  };
}