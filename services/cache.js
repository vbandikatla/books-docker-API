const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const config = require("../config");

const client = redis.createClient({
   host: config.REDIS_HOST,
   port: config.REDIS_PORT,
   retry_strategy: () => 500
});
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = (options = { time: 30 }) => {
    this.useCache = true;
    this.time = options.time;
    this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);

    return this;
};

mongoose.Query.prototype.exec = async () => {
    if (!this.useCache) return await exec.apply(this, arguments);

    const key = JSON.stringify({
        ...this.getQuery()
    });

    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        console.debug(`responding from cache`);
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);
    console.debug(this.time);
    client.hset(this.hashKey, key, JSON.stringify(result));
    client.expire(this.hashKey, this.time);
    console.debug(`response from MongoDB`);
    return result;
};

module.exports = {
    clearKey(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}