import BlinkingCursor from './BlinkingCursor';

interface CommandPanelProps {
  clientId: string;
  availableClients: string[];
  recipient: string;
  setRecipient: (client: string) => void;
  message: string;
  setMessage: (message: string) => void;
  sendMessage: (e: React.FormEvent) => void;
  handleSpecialCommand: (cmd: string) => void;
  playKeystroke: () => void;
}

export default function CommandPanel({
  availableClients,
  recipient,
  setRecipient,
  message,
  setMessage,
  sendMessage,
  handleSpecialCommand,
  playKeystroke
}: CommandPanelProps) {
  return (
    <div className="bg-gray-900 border-2 border-green-400 rounded overflow-hidden flex flex-col">
      <div className="bg-green-600 px-3 py-1 text-base text-green-100 border-b-2 border-green-400 font-bold">
        command_center.exe
      </div>
      
      <div className="p-3 space-y-4 text-base flex-grow">
        <div>
          <h3 className="text-cyan-300 mb-2 text-base font-bold">AVAILABLE OPERATIVES:</h3>
          <div className="bg-gray-800 border-2 border-green-400 p-2 max-h-24 overflow-y-auto">
            {availableClients.length === 0 ? (
              <p className="text-red-300 font-bold">No operatives online</p>
            ) : (
              availableClients.map((client) => (
                <div 
                  key={client} 
                  className={`flex items-center space-x-2 py-1 cursor-pointer hover:text-cyan-300 ${recipient === client ? 'text-cyan-300' : 'text-green-300'} font-bold`}
                  onClick={() => setRecipient(client)}
                >
                  <span className="inline-block h-3 w-3 rounded-full bg-green-400"></span>
                  <span>{client}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-cyan-300 mb-2 text-base font-bold">QUICK COMMANDS:</h3>
          <div className="grid grid-cols-2 gap-2">
            {['prepare', 'question', 'join', 'wake up'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleSpecialCommand(cmd)}
                className="bg-green-700 border-2 border-green-400 px-2 py-1 text-base hover:bg-green-600 hover:text-cyan-300 text-left font-bold text-green-100"
              >
                /{cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <form onSubmit={sendMessage} className="mt-auto p-3 border-t-2 border-green-400">
        <div className="mb-2">
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-gray-800 border-2 border-green-400 rounded px-2 py-1 text-green-300 focus:outline-none focus:border-cyan-300 text-base w-full font-bold"
            required
          >
            <option value="">SELECT TARGET</option>
            {availableClients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (e.target.value.length % 3 === 0) playKeystroke();
            }}
            rows={2}
            className="bg-gray-800 border-2 border-green-400 rounded w-full px-3 py-2 text-green-300 resize-none focus:outline-none focus:border-cyan-300 text-base font-medium"
            placeholder="Enter transmission data..."
            required
          />
          <div className="absolute bottom-2 right-3">
            <BlinkingCursor />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!recipient}
          className="bg-green-700 hover:bg-green-600 border-2 border-green-400 mt-2 px-4 py-1 rounded text-base font-mono font-bold disabled:opacity-50 w-full glitch-hover text-green-100"
        >
          TRANSMIT
        </button>
      </form>
    </div>
  );
}