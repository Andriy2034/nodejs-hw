import crypto from "crypto";
import { Session } from "../models/session.js";


export const createSession = async (userId) => {
  return Session.create({
      userId,
      accessToken: crypto.randomUUID(),
      refreshToken: crypto.randomUUID(),
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
};

export const setSessionCookie = async (res, session) => {
  res.cookie("accessToken", session.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
    expires: session.accessTokenValidUntil,
  });

  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    expires: session.refreshTokenValidUntil,
  });

   res.cookie("sessionId", session._id.toString(), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    expires: session.refreshTokenValidUntil,
  });

};
