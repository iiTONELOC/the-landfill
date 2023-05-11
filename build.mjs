import * as fs from 'fs';
import * as path from 'path';
import { cwd } from 'process';
import { exec } from 'child_process';

exec('npm run lint && rimraf ./lib && tsc', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
    console.log(stderr);
}).on('close', () => {
    const dirname = cwd();

    if (!fs.existsSync(path.join(dirname, './lib'))) {
        fs.copyFileSync(
            path.join(dirname, './src/graphql/schema.graphql'),
            path.join(dirname, './lib/graphql/schema.graphql')
        );
    }

    process.stdout.write('Build complete!\n');
    process.exit(0);
});

