# books-docker-API

## How to install and run?
```sh
docker-compose build
docker-compose up
```

## How services interact?
  - requests are processed by express and sent to mongoose
  - mongoose can choose to query redis, and mongoDB based on the request type
  - and update the cache content accordingly, and send a response to the route manager
