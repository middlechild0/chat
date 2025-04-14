import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [clientId, setClientId] = useState('');
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [messages, setMessages] = useState<{ type: string; from?: string; to?: string; message?: string; error?: string; timestamp: any }[]>([]);
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  
  useEffect(() => {
    // Create the socket connection
    socketRef.current = io();
    
    // Set up event listeners
    socketRef.current.on('clientList', (clients: string[]) => {
      // Filter out our own ID
      setAvailableClients(clients.filter((id: string) => id !== clientId));
    });
    
    socketRef.current.on('receiveMessage', (data) => {
      setMessages(prev => [...prev, {
        type: 'received',
        from: data.from,
        message: data.message,
        timestamp: data.timestamp
      }]);
    });
    
    socketRef.current.on('messageSent', (data) => {
      setMessages(prev => [...prev, {
        type: 'sent',
        to: data.to,
        message: data.message,
        timestamp: data.timestamp
      }]);
    });
    
    socketRef.current.on('messageError', (data) => {
      setMessages(prev => [...prev, {
        type: 'error',
        to: data.to,
        error: data.error,
        timestamp: new Date()
      }]);
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [clientId]);
  
  const registerClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim()) {
      if (socketRef.current) {
        socketRef.current.emit('register', clientId);
      }
      setRegistered(true);
    }
  };
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && recipient) {
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          to: recipient,
          from: clientId,
          message
        });
      }
      
      setMessage('');
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Simple Chat</h1>
      
      {!registered ? (
        // Registration form
        <form onSubmit={registerClient} className="mb-4">
          <div className="mb-2">
            <label className="block mb-1">Enter your ID:</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Your unique ID"
              required
            />
          </div>
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </form>
      ) : (
        // Chat interface
        <div>
          <div className="mb-4">
            <p className="font-semibold">Your ID: {clientId}</p>
            <p className="text-sm">Available clients: {availableClients.length}</p>
          </div>
          
          {/* Message form */}
          <form onSubmit={sendMessage} className="mb-4">
            <div className="mb-2">
              <label className="block mb-1">Send to:</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select recipient</option>
                {availableClients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-2">
              <label className="block mb-1">Message:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Type your message"
                rows={3}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={!recipient}
            >
              Send Message
            </button>
          </form>
          
          {/* Message history */}
          <div className="border rounded p-2 h-64 overflow-y-auto">
            <h2 className="font-semibold mb-2">Messages:</h2>
            
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded ${
                      msg.type === 'sent' 
                        ? 'bg-blue-100 ml-8' 
                        : msg.type === 'received' 
                        ? 'bg-green-100 mr-8' 
                        : 'bg-red-100'
                    }`}
                  >
                    {msg.type === 'sent' && (
                      <p className="text-xs text-gray-600">To: {msg.to}</p>
                    )}
                    {msg.type === 'received' && (
                      <p className="text-xs text-gray-600">From: {msg.from}</p>
                    )}
                    {msg.type === 'error' ? (
                      <p className="text-red-600">{msg.error}</p>
                    ) : (
                      <p>{msg.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}