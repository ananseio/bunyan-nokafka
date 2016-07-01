# Bunyan Kafka Stream Plugin
**bunyan-nokafka** is Bunyan stream for Kafka with [no-kafka](https://www.npmjs.com/package/no-kafka) library.

## Usage
```
const bunyan = require('bunyan');
const KafkaStream = require('bunyan-nokafka');

const logger = bunyan.createLogger({
  name: 'cached-rethinkdb-test',
});

const kafkaStream = new KafkaStream({
  topic: 'log-topic',
  kafkaOpts: {
    connectionString: '127.0.0.1:9092',
  },
});

kafkaStream.on('ready', () => {
  logger.addStream({
    level: bunyan.INFO,
    stream: kafkaStream,
  });
});
```

## Kafka Options
Please refer to [no-kafka producer options](https://www.npmjs.com/package/no-kafka#producer-options)

## Author
Ananse IO <opensource@ananse.io>

## License: Apache 2.0