# Serverless Mocker


Work in progress...





A lightweight testing framework for the Serverless Framework that mocks events.

## Features

* Write mock events and invoke your functions with them while you write code.
* On save, this plugin automatically invokes your Function w/ each mock event and prints results in your console.
* Features a `local` or `remote` mode.  `remote` mode will quickly deploy your function before invoking it with mock data.
* Write multiple mock events for each event for your functions.

## Quick-Start

Install with npm:

```
npm i serverless-mocker-plugin --save
```

Add it to your Serverless Service plugins:

```
plugins
  - serverless-mocker-plugin
```

Add a mock property to your Functions:

```yml
# serverless.yml

functions
  hello
    handler: index.hello
    events:
      - http:
          path: hello
          method: get
          mocks: ${file(./mocks.yml):hello} # References to another file which contains the mocks
```

Create a `mocks.yml` file in your service folder:

```yml
# mocks.yml

hello_http: # Contains the mock for the "hello" function and "http" event
  succcess: # A mock for this function event
    query:
      clientId: aslkfjasf8kajsf981
  fail: # Another mock for this function event
    query:
      clientId: false
```

Start the plugin:

```
sls flow --function hello
```

Write code, hit save, and your function will be auto-invoked for each mock.

When you're done working locally, switch the `mode` to `remote` to test your mocks against live Lambdas

```
sls flow --function hello --mode remote // Remote mode invokes the function on Lambda
```
