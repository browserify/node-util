var spawn = require('child_process').spawnSync;

spawn(process.argv[0], [ require.resolve('./debug') ], { stdio: 'inherit' });
spawn(process.argv[0], [ require.resolve('./format') ], { stdio: 'inherit' });
spawn(process.argv[0], [ require.resolve('./inspect') ], { stdio: 'inherit' });
spawn(process.argv[0], [ require.resolve('./log') ], { stdio: 'inherit' });
spawn(process.argv[0], [ require.resolve('./promisify') ], { stdio: 'inherit' });
