'use strict';

// TODO PR webpack plugin to use deploy function

const chokidar = require('chokidar');
const execSync = require('child_process').execSync;
const path = require('path');
const merge = require('lodash/merge');
const has = require('lodash/has');
const get = require('lodash/get');
const os = require('os');

let isRunning = false;

class ServerlessFlowPlugin {

  constructor(serverless, options) {

    this.serverless = serverless;
    this.options = options;

    this.commands = {
      flow: {
        usage: 'Watches your code, deploys and invokes w/ event mocks on every change',
        lifecycleEvents: [
          'start',
        ],
        options: {
          function: {
            // eslint-disable-next-line max-len
            usage: 'Specify the function you want to use (e.g. "--function myFunction" or "-f myFunction")',
            required: true,
            shortcut: 'f',
          },
          mode: {
            usage: 'Tell Flow to invoke functions remotely or locally',
            shortcut: 'm',
          },
          logs: {
            usage: 'Show function logs',
            shortcut: 'l',
          },
        },
      },
    };

    this.hooks = {
      'before:flow:start': this.start.bind(this),
    };
  }

  start() {
    console.log(os.EOL);
    this.serverless.cli.log('Welcome To Flow Mode');

    const filterOptions = {
      ignored: [
        /[\/\\]\./,
        /(node_modules)/,
        /(npm\-debug\.log)/,
        /(\.serverless)/,
        // /(serverless\.yml)/,
        // /(mocks\.yml)/,
      ],
      ignoreInitial: true,
      followSymlinks: false,
    };

    chokidar.watch(this.serverless.config.servicePath, filterOptions)
    .on('all', () => {
      if (!isRunning) {
        this.run();
      }
      // TODO make sure it runs a second time with newchanges
    });
  }

  /**
  * Run
  */

  run() {

    const that = this;
    isRunning = true;
    const functionKey = that.options.function;
    that.options.mode = that.options.mode || 'local';

    console.log(os.EOL);
    that.serverless.cli.log('Flow Mode - Activated ----------------');

    // Reload service
    that.serverless.service.load(that.options)
    .then(() => {

      // Reload variables - do this in case there is a JS variable script
      that.serverless.variables.populateService(that.options);

      if (that.options.mode === 'remote') {
        that.deploy();
        that.invoke();
      }

      if (that.options.mode === 'local') {
        that.invoke();
      }

      isRunning = false;
    });
  }

  /**
  * Deploy
  */

  deploy() {

    // this.serverless.cli.log(`Flow Mode - Deploying Function: ${this.options.function}`);

    try {
      execSync(`serverless deploy function -f ${this.options.function}`, { stdio: 'inherit' });
    } catch (err) {
      console.log(`Failed to deploy the function`);
      isRunning = false;
      return;
    }
  }

  /**
  * Invoke
  */

  invoke() {

    let that = this;

    // Get mocks
    let events = this.getMocks(this.options.function);

    events.forEach(function(mocks) {
      mocks.forEach(function(mock) {

        // console.log(os.EOL);
        that.serverless.cli.log(`Flow Mode - Invoking Function: '${that.options.function}', Event: '${mock.event}', Mock: '${mock.title}'`);

        // Invoke
        try {
          execSync(`serverless invoke ${that.options.mode === 'local' ? 'local' : ''} -f ${that.options.function} -d '${JSON.stringify(mock.body)}' ${that.options.logs ? '-l' : ''}`, { stdio: 'inherit' });
        } catch (err) {
          console.log(`Failed to invoke the function using`);
        }

      });
    });
  }

  /**
  * Get Test Mocks
  */

  getMocks(func) {

    let mocks = [];
    let service = this.serverless.service;

    this.checkFunctionExists(func);

    // If function has events, get test mocks
    if (!service.functions[func].events
      || !service.functions[func].events.length) {
        return [[{}]];
      }

      service.functions[func].events.forEach(function(e) {

        let eventName = Object.keys(e)[0];
        let eventObj = e[eventName];

        // TODO: Load mock events

        if (!eventObj.mocks || !Object.keys(eventObj.mocks).length) return;

        let eventMocks = [];

        Object.keys(eventObj.mocks).forEach(function(m) {

          eventMocks.push({
            event: eventName,
            title: m,
            body: eventObj.mocks[m] || {}
          });
        });

        mocks.push(eventMocks)
      });

      return mocks;
    }
  }

  /**
  * Check Function exists
  */

  checkFunctionExists(func) {
    if (!this.serverless.service.functions
      || !this.serverless.service.functions[func]) {
        throw new this.serverless.classes.Error(`Function "${func}" does not exist`);
      }
    }
  }

  /*
   * Load event
   * - Load event from dictionary
   */

   // TODO: Finish
  loadEvent() {

  }

  module.exports = ServerlessFlowPlugin;
