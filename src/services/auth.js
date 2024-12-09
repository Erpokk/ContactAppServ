// Core Node.js modules
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomBytes } from 'crypto';

// NPM modules
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';

// Project modules
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { TEMPLATES_DIR, SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMails.js';
import { getFullNameFromGoogleTokenPayload, validateCode } from '../utils/googleOAuth2.js';
import { createSession } from '../utils/sessionUtils.js';


export const registerUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (user) {
        throw createHttpError(409, 'Email in use');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await UsersCollection.create({
        ...payload,
        password: encryptedPassword,
    });
};

export const logoutUser = async (sessionId) => {
    await SessionsCollection.deleteOne({ _id: sessionId });
};

export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(404, 'Email not found');
    };

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if (!isEqual) {
        throw createHttpError(401, 'Unauthorized');
    }


    await SessionsCollection.deleteOne({ userId: user._id });

    const sessionData = createSession();


    return await SessionsCollection.create({
        userId: user._id,
        ...sessionData,
    });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {

    const session = await SessionsCollection.findOne({ _id: sessionId, refreshToken });

    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
    }

    const newSession = createSession();
    await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });



    const createdSession = await SessionsCollection.create({
        userId: session.userId,
        ...newSession,
    });

    const user = await UsersCollection.findOne({_id: createdSession.userId});

    return {
        user,
        createdSession
    };
};

export const requestResetToken = async (email) => {
    const user = await UsersCollection.findOne({ email });
    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const resetToken = jwt.sign(
        {
            sub: user._id,
            email
        },
        env('JWT_SECRET'),
        {
            expiresIn: '15m',
        },
    );

    const resetPasswordTemplatePath = path.join(TEMPLATES_DIR, 'reset-password-email.html');

    const templateSource = (await fs.readFile(resetPasswordTemplatePath)).toString();

    const template = handlebars.compile(templateSource);
    const html = template({
        name: user.name,
        link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`
    });
    console.log(`Attempting to send password reset email to ${email}`);
    try {
        await sendEmail({
            from: env(SMTP.SMTP_FROM),
            to: email,
            subject: 'Reset your password',
            html,
        });
        console.log('Email successfully sent!');
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        throw createHttpError(500, 'Failed to send reset email');
    }
    console.log('Email successfully sent!');
};

export const resetPassword = async (payload) => {
    let entries;
    try {
        entries = jwt.verify(payload.token, env('JWT_SECRET'));
    } catch (err) {
        if (err instanceof Error) throw createHttpError(401, err.message);
        throw err;
    }

    const user = await UsersCollection.findOne({
        email: entries.email,
        _id: entries.sub,
    });

    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UsersCollection.updateOne(
        { _id: user._id },
        {$set: {password: encryptedPassword}},
    );
};

export const loginOrSignupWithGoogle = async (code) => {
    const loginTicket = await validateCode(code);
    const payload = loginTicket.getPayload();

    if (!payload) throw createHttpError(401);

    let user = await UsersCollection.findOne({ email: payload.email });

    if (!user) {
        const password = await bcrypt.hash(randomBytes(10), 10);
        user = await UsersCollection.create({
            email: payload.email,
            name: getFullNameFromGoogleTokenPayload(payload),
            password,
            role: 'parent',
        });
    }

    const newSession = createSession();

    return await SessionsCollection.create({
        userId: user._id,
        ...newSession,
    });
};
