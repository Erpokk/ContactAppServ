import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';
import {
  logoutUser,
  refreshUsersSession,
  registerUser,
  resetPassword,
} from '../services/auth.js';
import { loginUser } from '../services/auth.js';
import {
  requestResetToken,
  loginOrSignupWithGoogle,
} from '../services/auth.js';
import { generateAuthUrl } from '../utils/googleOAuth2.js';
import { createSession } from '../utils/sessionUtils.js';
import { setupSession } from '../utils/sessionUtils.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  const sessionData = createSession();

  const session = await SessionsCollection.create({
    userId: user._id,
    ...sessionData,
  });

  setupSession(res, session);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      user: {
        name: user.name,
        email: user.email,
      },
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserControllerler = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);
  const user = await UsersCollection.findById(session.userId);

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
      user,
    },
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session.createdSession);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.createdSession.accessToken,
      user: session.user,
    },
  });
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};

export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const loginWithGoogleController = async (req, res) => {
  const session = await loginOrSignupWithGoogle(req.body.code);
  console.log('req.body :>> ', req.body);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
