import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { Writable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';
import authRouter from '../src/routes/authRoutes.js';
import userRouter from '../src/routes/userRoutes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { User } from '../src/models/user.js';
import { Session } from '../src/models/session.js';

process.env.JWT_SECRET = 'test-only-secret';
process.env.FRONTEND_DOMAIN = 'https://frontend.example';
const id = '507f1f77bcf86cd799439011';
const email = 'user@example.com';
let currentUser;
let mail;
let mailFails = false;
let deletedSessions;
User.findOne = async () => currentUser;
User.findById = async () => currentUser;
User.findByIdAndUpdate = async (userId, update) => {
  assert.equal(userId, id);
  return { avatar: update.avatar };
};
Session.findOne = async () => ({ userId: id, accessTokenValidUntil: new Date(Date.now() + 60000) });
Session.deleteMany = async (filter) => { deletedSessions = filter; };
nodemailer.createTransport = () => ({ sendMail: async (options) => {
  if (mailFails) throw new Error('SMTP unavailable');
  mail = options;
} });
cloudinary.uploader.upload_stream = (options, callback) => new Writable({
  write(chunk, encoding, done) { done(); },
  final(done) {
    assert.equal(options.public_id, id);
    callback(null, { secure_url: 'https://images.example/avatar.png' });
    done();
  },
});
const app = express();
app.use(express.json(), cookieParser(), authRouter, userRouter, errors(), errorHandler);
const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
after(() => new Promise((resolve) => server.close(resolve)));
const base = `http://127.0.0.1:${server.address().port}`;
const post = (path, body) => fetch(base + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const token = (options = {}) => jwt.sign({ sub: id, email }, process.env.JWT_SECRET, { expiresIn: '15m', ...options });
const avatar = (file, cookie = true) => {
  const body = new FormData();
  if (file) body.set('avatar', file, 'avatar.png');
  return fetch(base + '/users/me/avatar', {
    method: 'PATCH', body,
    headers: cookie ? { Cookie: `sessionId=${id}; accessToken=test` } : {},
  });
};

test('reset email validates email and hides absent users', async () => {
  assert.equal((await post('/auth/request-reset-email', { email: 'bad' })).status, 400);
  currentUser = null;
  const response = await post('/auth/request-reset-email', { email });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { message: 'Password reset email sent successfully' });
});
test('email includes a signed 15 minute token and SMTP failure returns 500', async () => {
  currentUser = { _id: id, email, username: '<b>User</b>' };
  assert.equal((await post('/auth/request-reset-email', { email })).status, 200);
  assert.ok(mail.html.includes('&lt;b&gt;User&lt;/b&gt;'));
  const link = new URL(mail.html.match(/href="([^"]+)"/)[1].replaceAll('&#x3D;', '=').replaceAll('&amp;', '&'));
  assert.equal(link.origin, process.env.FRONTEND_DOMAIN);
  assert.equal(link.pathname, '/reset-password');
  const payload = jwt.verify(link.searchParams.get('token'), process.env.JWT_SECRET);
  assert.equal(payload.exp - payload.iat, 900);
  assert.equal(payload.sub, id);
  assert.equal(payload.email, email);
  mailFails = true;
  const response = await post('/auth/request-reset-email', { email });
  assert.equal(response.status, 500);
  assert.equal((await response.json()).message, 'Failed to send the email, please try again later.');
  mailFails = false;
});
test('reset rejects missing, invalid, expired tokens and unknown users', async () => {
  assert.equal((await post('/auth/reset-password', { password: 'new-password' })).status, 400);
  for (const value of ['invalid', token({ expiresIn: -1 })]) {
    const response = await post('/auth/reset-password', { token: value, password: 'new-password' });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).message, 'Invalid or expired token');
  }
  currentUser = null;
  assert.equal((await post('/auth/reset-password', { token: token(), password: 'new-password' })).status, 404);
});
test('reset hashes and saves password and removes old sessions', async () => {
  let saved = false;
  currentUser = { _id: id, email, save: async () => { saved = true; } };
  const response = await post('/auth/reset-password', { token: token(), password: 'new-password' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).message, 'Password reset successfully');
  assert.ok(saved);
  assert.ok(await bcrypt.compare('new-password', currentUser.password));
  assert.deepEqual(deletedSessions, { userId: id });
});
test('avatar requires authentication and an image no larger than 2MB', async () => {
  assert.equal((await avatar(null, false)).status, 401);
  let response = await avatar(null);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'No file');
  response = await avatar(new Blob(['text'], { type: 'text/plain' }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Only images allowed');
  response = await avatar(new Blob([Buffer.alloc(2 * 1024 * 1024 + 1)], { type: 'image/png' }));
  assert.equal(response.status, 400);
  response = await avatar(new Blob(['test-image-buffer'], { type: 'image/png' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { url: 'https://images.example/avatar.png' });
});
test('user model has default avatar and does not serialize password', () => {
  const user = new User({ email, password: 'hash' });
  assert.equal(user.avatar, 'https://ac.goit.global/fullstack/react/default-avatar.jpg');
  assert.equal(user.toJSON().password, undefined);
});
