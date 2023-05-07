import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import connect from './db/connection';
import { resolvers } from './graphql/resolvers';
import { ApolloServer } from '@apollo/server';
import { AuthenticatedContext } from './types';
import { jwtMiddleware } from './auth/jwtMiddleware';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';


const startServer = async () => {
    // http and express server
    const app = express();
    const port = process.env.PORT || 3001;
    const httpServer = http.createServer(app);

    app.set('port', port);
    app.disable('x-powered-by');
    app.disable('etag');


    // apollo server
    const apolloServer = new ApolloServer<AuthenticatedContext>({
        typeDefs: fs.readFileSync(path.join(__dirname, './graphql/schema.graphql'), 'utf8'),
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
        process.env.NODE_ENV !== 'production' ? ApolloServerPluginLandingPageLocalDefault({ footer: false })
            : undefined].filter(x => x) as any
    });

    // start the server
    await apolloServer.start();

    // attach the the server to the graphql endpoint
    // enable cors, json body parser and jwt middleware
    app.use(
        '/graphql',
        cors(),
        bodyParser.json(),
        expressMiddleware(apolloServer, {
            context: async ({ req }) => ({ user: jwtMiddleware(req) })
        })
    );

    // await successful connection to the database
    await connect();
    // start the http server
    await new Promise<void>(resolve => httpServer.listen({ port }, resolve));
    process.env.NODE_ENV !== 'production' && console.log(`🚀 Development Server ready at http://localhost:${port}/graphql\n`);//NOSONAR
};

startServer();
