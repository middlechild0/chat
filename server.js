const {createServer} = require('http');
const {parse} = require('url');
const next = require('next');
const socketIo = require('socket.io');
const { timeStamp } = require('console');
const { server } = require('typescript');

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });
    
    const io = socketIo(server);

    //Kep track of connected clients
    const clients = new Map(); 
    
    io.on('connection', (socket) => {
        console.log('a user connected');
        
        //Register client with a unique ID
        socket.on('register', (clientId) => {
            console.log(`Client registered: ${clientId}`);
            socket.clientId = clientId;
        });

        //Handles messages sending
        socket.on('sendMessage', (message) => {
            const{to, from, message } = message;
            console.log(`Message from ${from} to ${to}: ${message}`);

        //Find Recipient
        const recipientSocket = clients.get(to);
        if(recipientSocket){
            //send message to recipient
            recipientSocket.emit('receiveMessage', {
                from, 
                message,
                timeStamp: new Date().toISOString()
             });
        }else{
            //Notify sender that recipient is not connected
            socket.emit('userOffline', to);
            console.log(`User ${to} is offline`);
        }
        });

        // Remove client from clients map on disconnect
        socket.on('disconnect', () => {
            for (const [clientId, clientSocket] of clients.entries()) {
                if (clientSocket === socket) {
                    clients.delete(clientId);
                    console.log(`Client disconnected: ${clientId}`);
                    break;
                }
            }
        });
    });
});

server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
});
//server.js