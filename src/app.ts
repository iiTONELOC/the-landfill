import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { authMiddleware } from './auth/middleware';
import resolvers from './graphql/schema/resolvers';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';






interface AuthenticatedContext {
    token?: string;
}

const startServer = async () => {
    // Required logic for integrating with Express
    const app = express();

    const port = process.env.PORT || 3001;

    // Our httpServer handles incoming requests to our Express app.
    // Below, we tell Apollo Server to "drain" this httpServer,
    // enabling our servers to shut down gracefully.
    const httpServer = http.createServer(app);

    // Same ApolloServer initialization as before, plus the drain plugin
    // for our httpServer.
    const server = new ApolloServer<AuthenticatedContext>({
        typeDefs: fs.readFileSync(path.join(__dirname, './graphql/schema/schema.graphql'), 'utf8'),
        resolvers: undefined,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
        process.env.NODE_ENV !== 'production' ? ApolloServerPluginLandingPageLocalDefault({ footer: false })
            : undefined].filter((x) => x) as any
    });
    // Ensure we wait for our server to start
    await server.start();

    app.set('port', port);
    app.disable('x-powered-by');
    app.disable('etag');

    app.use(
        '/graphql',
        cors(),
        bodyParser.json(),
        // expressMiddleware accepts the same arguments:
        // an Apollo Server instance and optional configuration options
        expressMiddleware(server, {
            context: async ({ req }) => ({ token: authMiddleware(req) })
        })
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: app.get('port') }, resolve));
    console.log(`🚀 Server ready at http://localhost:${port}/\n`);//NOSONAR
};

startServer();
