import * as fs from 'fs';
import * as path from 'path';
import { cwd } from 'process';

const dirname = cwd();


if (fs.existsSync(path.join(dirname, 'lib', 'graphql'))) {
    fs.copyFileSync(
        path.join(dirname, 'src', 'graphql', 'schema.graphql'),
        path.join(dirname, 'lib', 'graphql', 'schema.graphql')
    );
}

process.stdout.write('Build complete!\n');
process.exit(0);