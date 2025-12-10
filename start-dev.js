const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
    try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        console.log('MongoMemoryServer started at:', uri);

        const env = { ...process.env, DB: uri };

        // Run the server
        const serverProcess = spawn('node', ['server.js'], {
            env: env,
            stdio: 'inherit',
            cwd: __dirname
        });

        serverProcess.on('close', async (code) => {
            console.log(`Server process exited with code ${code}`);
            await mongod.stop();
            process.exit(code);
        });

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
