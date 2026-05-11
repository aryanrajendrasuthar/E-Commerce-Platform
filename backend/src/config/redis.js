const Redis = require('ioredis');

let redis;

const connectRedis = () => {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    lazyConnect: true,
  });

  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err.message));

  return redis;
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
