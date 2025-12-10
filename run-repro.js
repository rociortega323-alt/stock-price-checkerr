const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
    try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        console.log('MongoMemoryServer started at:', uri);

        const env = { ...process.env, NODE_ENV: 'test', DB: uri };

        // Run the tests using mocha directly via npx or finding the binary
        // Using spawn to run mocha on the repro file
        const mocha = spawn('npx', ['mocha', '--ui', 'tdd', 'repro-test.js'], {
            env: env,
            stdio: 'inherit',
            cwd: __dirname,
            shell: true
        });

        mocha.on('close', async (code) => {
            console.log(`Mocha exited with code ${code}`);
            await mongod.stop();
            process.exit(code);
        });

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
