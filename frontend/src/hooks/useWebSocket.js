import { useEffect, useState, useCallback, useRef } from 'react';

export const useWebSocket = (websocketClient) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const listenersRef = useRef([]);

  useEffect(() => {
    if (!websocketClient) return;

    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleMessage = (data) => {
      setLastMessage(data);
    };

    const handleError = (err) => {
      setError(err);
    };

    // Register listeners
    websocketClient.on('connected', handleConnected);
    websocketClient.on('disconnected', handleDisconnected);
    websocketClient.on('message', handleMessage);
    websocketClient.on('error', handleError);

    // Connect
    websocketClient.connect();

    // Cleanup
    return () => {
      websocketClient.off('connected', handleConnected);
      websocketClient.off('disconnected', handleDisconnected);
      websocketClient.off('message', handleMessage);
      websocketClient.off('error', handleError);
    };
  }, [websocketClient]);

  const sendMessage = useCallback(
    (data) => {
      if (websocketClient && isConnected) {
        websocketClient.send(data);
      }
    },
    [websocketClient, isConnected]
  );

  const subscribe = useCallback(
    (event, callback) => {
      if (websocketClient) {
        websocketClient.on(event, callback);
        listenersRef.current.push({ event, callback });
      }
    },
    [websocketClient]
  );

  const unsubscribe = useCallback(
    (event, callback) => {
      if (websocketClient) {
        websocketClient.off(event, callback);
        listenersRef.current = listenersRef.current.filter(
          (listener) => listener.event !== event || listener.callback !== callback
        );
      }
    },
    [websocketClient]
  );

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    subscribe,
    unsubscribe,
  };
};

export default useWebSocket;
