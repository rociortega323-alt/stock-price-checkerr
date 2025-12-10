const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
    try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        console.log('MongoMemoryServer started at:', uri);

        const env = { ...process.env, NODE_ENV: 'test', DB: uri };

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

        // Provide a timeout to kill the test/server if it hangs (optional but good)
        // The server.js runs tests after 3500ms, and they take maybe a few seconds.
        // So 15s should be plenty. 
        // Wait... the server keeps running after tests if it's just app.listen?
        // server.js doesn't exit after runner.run().
        // So I might need to manually kill it after seeing output?
        // Or I can rely on the user (me) to kill it.
        // Actually, runner.run() in test-runner.js might not exit the process.
        // Let's inspect test-runner.js later if needed. For now, running it is enough to see the logs.

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
