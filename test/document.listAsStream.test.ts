import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should get a streamed list of documents - GET /db/_all_docs - db.listAsStream", async () => {
  const response = {
    total_rows: 23516,
    offset: 0,
    rows: [
      {
        id: '1000501',
        key: '1000501',
        value: {
          rev: '2-46dcf6bf2f8d428504f5290e591aa182'
        }
      },
      {
        id: '1000543',
        key: '1000543',
        value: {
          rev: '1-3256046064953e2f0fdb376211fe78ab'
        }
      },
      {
        id: '100077',
        key: '100077',
        value: {
          rev: '1-101bff1251d4bd75beb6d3c232d05a5c'
        }
      }
    ]
  };

  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  return new Promise(async (resolve, reject) => {
    let responseArray: Uint8Array = new Uint8Array([]);
    const db = nano.db.use('db');
    const stream = await db.listAsStream();
    const reader = stream.getReader();

    reader.read().then(function processStream({ done, value }: {done: boolean, value: any}) {
      if (done) {
        if(value) {
          responseArray =  new Uint8Array([...responseArray, ...value]);
        }

        const responseString = JSON.parse(new TextDecoder("utf-8").decode(responseArray.buffer));

        assertEquals(responseString, response);
        fetchStub.restore();
        resolve();
        return;
      }

      responseArray = new Uint8Array([...responseArray, ...value]);
  
      // Read some more, and call this function again
      return reader.read().then(processStream);
    });
  });
});

Deno.test("should get a streamed list of documents with opts- GET /db/_all_docs - db.listAsStream", async () => {
  const response = {
    total_rows: 23516,
    offset: 0,
    rows: [
      {
        id: '1000501',
        key: '1000501',
        value: {
          rev: '2-46dcf6bf2f8d428504f5290e591aa182'
        },
        doc: {
          _id: '1000501',
          _rev: '2-46dcf6bf2f8d428504f5290e591aa182',
          a: 1,
          b: 2
        }
      }
    ]
  };

  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  return new Promise(async (resolve, reject) => {
    let responseArray: Uint8Array = new Uint8Array([]);
    const db = nano.db.use('db');
    const stream = await db.listAsStream({ limit: 1, include_docs: true });
    const reader = stream.getReader();

    reader.read().then(function processStream({ done, value }: {done: boolean, value: any}) {
      if (done) {
        if(value) {
          responseArray =  new Uint8Array([...responseArray, ...value]);
        }

        const responseString = JSON.parse(new TextDecoder("utf-8").decode(responseArray.buffer));

        assertEquals(responseString, response);
        fetchStub.restore();
        resolve();
        return;
      }

      responseArray = new Uint8Array([...responseArray, ...value]);
  
      // Read some more, and call this function again
      return reader.read().then(processStream);
    });
  });
});
