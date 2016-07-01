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

const EventEmitter = require('events');
const Kafka = require('no-kafka');

function createKafkaProducer({options}) {
  const producer = new Kafka.Producer(options);
  return producer.init()
    .then(() => producer);
}

class KafkaStream extends EventEmitter {
  constructor({topic, kafkaOpts}) {
    super();
    if (!kafkaOpts) {
      throw new Error('Kafka options must be provided');
    }

    if (!topic) {
      throw new Error('KafkaStream must have a topic');
    }

    this.topic = topic;
    this.kafkaOpts = kafkaOpts;

    createKafkaProducer({ options: this.kafkaOpts }).then((producer) => {
      this.producer = producer;
      this.emit('ready');
    });
  }

  write(record) {
    this.producer.send({
      topic: this.topic,
      partition: 0,
      message: {
        value: record,
      },
    }).catch((err) => {
      this.emit('error', err);
    });
  }
}

module.exports = KafkaStream;
