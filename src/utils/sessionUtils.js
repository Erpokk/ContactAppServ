import { randomBytes } from "crypto";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";

export const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      path: '/',
      expires: new Date(Date.now() + ONE_DAY),
      sameSite: 'None',
      secure: true,
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      path: '/',
      expires: new Date(Date.now() + ONE_DAY),
      sameSite: 'None',
      secure: true,
    });
  };

export const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};
