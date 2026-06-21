import app, { serverReady } from '../backend/server.js';

export default async function handler(req, res) {
  await serverReady;
  return app(req, res);
}
