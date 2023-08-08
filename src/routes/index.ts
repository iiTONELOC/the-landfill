import cors from 'cors';
import { Router } from 'express';
import bodyParser from 'body-parser';
import webAuthnRoutes from './webAuthn';

const router = Router();

router.use('/webauthn', cors(), bodyParser.json(), webAuthnRoutes);

export default router;
