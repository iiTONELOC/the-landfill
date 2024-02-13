import {Router} from 'express';
import {User} from '../../db/Models';
import type {UserModel} from '../../db/types';
import {webAuthnAPI} from '../../auth/WebAuthn';
import {jwtMiddlewareWebAuthn} from '../../auth/jwtMiddleware';

const router = Router();

router.get('/attestation/options/:userId', jwtMiddlewareWebAuthn, async (req, res) => {
  //NOSONAR
  try {
    const _user: UserModel = (await User.findById({
      _id: req.params.userId,
    }).select('-password -__v')) as UserModel;
    // a user doesn't exist in the database
    if (!_user) {
      return res.status(401).json({message: 'Unauthorized'});
    }

    const options = await webAuthnAPI.generateRegistrationOptions(_user);

    return res.send(options);
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
});

router.post('/attestation/result/:userId', jwtMiddlewareWebAuthn, async (req, res) => {
  //NOSONAR
  try {
    const verification = await webAuthnAPI.verifyRegistrationResponse(req.params.userId, req.body);
    return res.send(verification);
  } catch (error) {
    return res.status(400).json({message: 'Invalid response'});
  }
});

router.get('/assertion/options/:username', async (req, res) => {
  //NOSONAR
  try {
    const _user: UserModel | undefined = (
      await User.find({username: req.params.username}).select('-password -__v')
    )[0]; // NOSONAR

    if (!_user) {
      throw new Error('Unknown error, please try again');
    }

    // the id is needed in the next step to access the session and verify the assertion response
    const {options, forUserId} = await webAuthnAPI.generateAuthenticationOptions(_user);

    return res.json({options, user: forUserId});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
});

router.post('/assertion/result/:userId', async (req, res) => {
  //NOSONAR
  try {
    const verification = await webAuthnAPI.verifyAuthenticationResponse(
      req.params.userId,
      req.body,
    );
    return res.send(verification);
  } catch (error) {
    console.log(error);
    return error === 'Authentication response could not be verified'
      ? res.status(500).json({message: 'Internal Server Error'})
      : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        res.status(400).json({message: error?.message ?? 'Invalid response'});
  }
});

export default router;
