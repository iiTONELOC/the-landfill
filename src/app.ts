import { default as express, Express } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.set('port', port);
app.disable('x-powered-by');
app.disable('etag');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use('/', (req, res) => {
    res.json({ message: 'Hello World' });
});


app.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
});

