import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is missing');
let cache = global.mongoose;
if (!cache) cache = global.mongoose = { conn: null, promise: null };

export default async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!cache.promise) cache.promise = mongoose.connect(uri, { bufferCommands: false }).then((m) => m);
  try { cache.conn = await cache.promise; } catch (err) { cache.promise = null; throw err; }
  return cache.conn;
}
