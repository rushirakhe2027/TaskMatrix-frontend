// Socket.IO Mock for Vercel Serverless Environment
// Vercel does not support persistent WebSockets (Socket.IO).
// This mock object prevents the frontend from crashing or spamming 404 errors.

const mockSocket = {
    emit: (event, data) => {
        console.log(`[Mock Socket] Emitted: ${event}`, data);
    },
    on: (event, callback) => {
        console.log(`[Mock Socket] Listening for: ${event}`);
    },
    off: (event) => {
        console.log(`[Mock Socket] Stopped listening for: ${event}`);
    },
    connect: () => { },
    disconnect: () => { },
    join: () => { },
    leave: () => { }
};

export const io = () => mockSocket;
export default mockSocket;
