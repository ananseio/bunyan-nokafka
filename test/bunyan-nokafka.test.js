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

const logTopic = 'bunyan-nokafka';
const connectionString = '127.0.0.1:9092';

describe('Kafka Bunyan Stream', () => {
  it('should be fail to construct without Kafka Options', () => {
    try {
      const kafkaStream = new KafkaStream({
        topic: logTopic,
      });
      expect(kafkaStream).to.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka options must be provided');
    }
  });

  it('should be fail to construct without partition function', () => {
    try {
      const kafkaStream = new KafkaStream({
        topic: logTopic,
        kafkaOpts: {
          connectionString,
        },
      });
      expect(kafkaStream).to.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka options must have a partitioner function');
    }
  });

  it('should be fail to construct without topic', () => {
    try {
      const kafkaStream = new KafkaStream({
        kafkaOpts: {
          connectionString,
          partitioner: KafkaStream.roundRobinPartitioner(),
        },
      });
      expect(kafkaStream).to.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'KafkaStream must have a topic');
    }
  });

  it('should be able to get partition in round robin flashion everytime when there is more than 1 partition', () => {
    const partitions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let curPartition = 0;
    const partitionFn = KafkaStream.roundRobinPartitioner();
    for (let i = 0; i < 100; i++) {
      expect(partitionFn('', partitions)).to.equal(curPartition);
      curPartition++;
      if (curPartition >= partitions.length) {
        curPartition = 0;
      }
    }
  });

  it('should be getting producer error properly', (done) => {
    const kafkaConsumer = new Kafka.SimpleConsumer({
      kafkaOpts: {
        connectionString,
      },
    });

    const logger = bunyan.createLogger({
      name: 'bunyan-nokafka-err-test',
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

    kafkaConsumer.init()
      .then(() => kafkaConsumer.subscribe(logTopic, [0, 1, 2, 3], (messageSet, topic, partition) => {
        messageSet.forEach((m) => {
          kafkaConsumer.commitOffset({ topic, partition, offset: m.offset });
          const logMsg = JSON.parse(m.message.value);
          expect(logMsg).to.have.deep.property('msg', 'test');
        });
      }))
      .then(() => {
        const kafkaStream = new KafkaStream({
          topic: logTopic,
          kafkaOpts: {
            connectionString,
            partitioner: () => {
            },
          },
        });

        kafkaStream.on('ready', () => {
          logger.addStream({
            level: bunyan.INFO,
            stream: kafkaStream,
          });

          logger.info('test');
        });

        kafkaStream.on('error', (err) => {
          expect(err).to.exist;
          expect(err).to.be.an.instanceOf(Error);
          expect(err).to.have.deep.property('message', 'Missing or wrong partition field');
          kafkaStream.removeAllListeners('error').removeAllListeners('ready');
          logger.removeStream
          return kafkaConsumer.unsubscribe(logTopic, [0, 1, 2, 3])
            .then(() => kafkaConsumer.end())
            .then(() => done());
        });
      });
  });

  it('should be able to write stream properly', (done) => {
    const kafkaConsumer = new Kafka.SimpleConsumer({
      kafkaOpts: {
        connectionString,
      },
    });

    const logger = bunyan.createLogger({
      name: 'bunyan-nokafka-test',
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

    kafkaConsumer.init()
      .then(() => kafkaConsumer.subscribe(logTopic, [0, 1, 2, 3], (messageSet, topic, partition) => {
        messageSet.forEach((m) => {
          kafkaConsumer.commitOffset({ topic, partition, offset: m.offset });
          const logMsg = JSON.parse(m.message.value);
          expect(logMsg).to.have.deep.property('msg', 'test');
        });
        done();
      }))
      .then(() => {
        const kafkaStream = new KafkaStream({
          topic: logTopic,
          kafkaOpts: {
            connectionString,
            partitioner: KafkaStream.roundRobinPartitioner(),
          },
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
      });
  });
});
