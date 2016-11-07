# Serverless-Flow

A lightweight testing framework for the Serverless Framework.

## Features

* Write mock events to invoke your functions with while you develop.
* On save, this plugin automatically invokes your Function w/ each mock event and prints results in your console.
* Features a `local` or `remote` mode.  `remote` mode will quickly deploy your function before invoking it with mock data.
* Write multiple mock events for each event for your functions.

## Quick-Start

### Install

* Install with npm:

```
npm i serverless-flow-plugin --save
```

* Add it to your Serverless Service plugins:

```
plugins
  - serverless-flow-plugin
```

### Write Mocks

* Add a mock property to your Functions:

```yml
# serverless.yml

functions
  hello
    handler: index.hello
    events:
      - http:
          path: hello
          method: get
          mocks: ${file(./mocks.yml):hello}
  world
    handler: index.world
    events:
      - http:
          path: world
          method: get
          mocks: ${file(./mocks.yml):world}
```

* Create a `mocks.yml` file in your service folder:

```yml
# mocks.yml

hello: # A function
  succcess: # A mock for this function
    query:
      clientId: aslkfjasf8kajsf981
  fail: # Another mock for this function
    query:
      clientId: false
world: # A function
  succcess: # A mock for this function
    query:
      clientId: aslkfjasf8kajsf981
  fail: # Another mock for this function
    query:
      clientId: false
```

### Use The Plugin

* Start the plugin:

```
sls flow --function hello --mode local // Local mode invokes the function locally
```

* Write code, hit save, and your function will be auto-invoked for each mock.

* When you're done working locally, switch the `mode` to `remote` to test your mocks against live Lambdas

```
sls flow --function hello --mode remote // Remote mode invokes the function on Lambda
```
