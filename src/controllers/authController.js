import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { createSession, setSessionCookie } from '../services/auth.js';
import { Session } from '../models/session.js';

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, 'Email is use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  const newSession = await createSession(newUser._id);

  setSessionCookie(res, newSession);

  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const newSession = await createSession(user._id);

  setSessionCookie(res, newSession);

  res.status(200).json(user);
};


export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if(sessionId) {
    await Session.deleteOne({_id: sessionId});
  }

    res.clearCookie("sessionId");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  if (!sessionId || !refreshToken) {
    throw createHttpError(401, "Missing session credentials");
  }

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  const isSessionTokenExpaired = session.refreshTokenValidUntil < new Date();

  if (isSessionTokenExpaired) {
    await session.deleteOne();
    res.clearCookie("sessionId");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    throw createHttpError(401, "Session token expired");
  }

  await session.deleteOne();

  const newSession = await createSession(session.userId);
  setSessionCookie(res, newSession);
  res.status(200).json({ message: "Session refreshd"});


};
