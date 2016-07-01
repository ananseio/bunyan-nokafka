/*
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
*/

'use strict';

const expect = require('chai').expect;
const bunyan = require('bunyan');
const Kafka = require('no-kafka');

const KafkaStream = require('../bunyan-nokafka');

const logTopic = 'local-logs';
const kafkaOpts = {
  connectionString: '127.0.0.1:9092',
};

const logger = bunyan.createLogger({
  name: 'cached-rethinkdb-test',
  streams: [
    {
      level: 'info',
      type: 'file',
      path: 'unittest.log',
    },
  ],
  serializers: {
    err: bunyan.stdSerializers.err,
  },
});

describe('Kafka Bunyan Stream', () => {
  let kafkaConsumer;
  before(() => {
    kafkaConsumer = new Kafka.SimpleConsumer({
      kafkaOpts,
    });
    return kafkaConsumer.init();
  });

  it('should be fail to construct without Kafka Options', () => {
    try {
      const kafkaStream = new KafkaStream({
        topic: 'local-logs',
      });
      expect(kafkaStream).to.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka options must be provided');
    }
  });

  it('should be fail to construct without topic', () => {
    try {
      const kafkaStream = new KafkaStream({
        kafkaOpts,
      });
      expect(kafkaStream).to.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'KafkaStream must have a topic');
    }
  });

  it('should be able to write stream properly', (done) => {
    const kafkaStream = new KafkaStream({
      topic: logTopic,
      kafkaOpts,
    });

    kafkaStream.on('ready', () => {
      logger.addStream({
        level: bunyan.INFO,
        stream: kafkaStream,
      });

      logger.info('test');
    });

    kafkaStream.on('error', (err) => {
      expect(err).to.not.exist;
      done(err);
    });

    kafkaConsumer.subscribe(logTopic, 0, (messageSet, topic, partition) => {
      messageSet.forEach((m) => {
        kafkaConsumer.commitOffset({ topic, partition, offset: m.offset});
        const logMsg = JSON.parse(m.message.value);
        expect(logMsg).to.have.deep.property('msg', 'test');
      });
      done();
    });
  });
});
