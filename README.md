[![Code Climate](https://codeclimate.com/github/ananse-io/bunyan-nokafka/badges/gpa.svg)](https://codeclimate.com/github/ananse-io/bunyan-nokafka)
[![Test Coverage](https://codeclimate.com/github/ananse-io/bunyan-nokafka/badges/coverage.svg)](https://codeclimate.com/github/ananse-io/bunyan-nokafka/coverage)
[![license][badge-license]][license]

# Bunyan Kafka Stream Plugin
**bunyan-nokafka** is [bunyan](https://github.com/trentm/node-bunyan) stream for [Kafka](http://kafka.apache.org/) with [no-kafka](https://www.npmjs.com/package/no-kafka) library.

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
Ananse Limited <opensource@ananse.io>

## License: Apache 2.0
