[![Build](https://travis-ci.org/ananseio/bunyan-nokafka.svg)](https://travis-ci.org/ananseio/bunyan-nokafka)
[![Code Climate](https://codeclimate.com/github/ananseio/bunyan-nokafka/badges/gpa.svg)](https://codeclimate.com/github/ananseio/bunyan-nokafka)
[![Test Coverage](https://codeclimate.com/github/ananseio/bunyan-nokafka/badges/coverage.svg)](https://codeclimate.com/github/ananseio/bunyan-nokafka/coverage)
[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

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
    partitioner: KafkaStream.roundRobinPartitioner(),
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
Copyright 2016 Ananse Limited

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
