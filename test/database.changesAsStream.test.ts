import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib2/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = {
  results: [
    {
      seq: '1-nC1J',
      id: 'c42ddf1272c7d05b2dc45b6962000b10',
      changes: [
        {
          rev: '1-23202479633c2b380f79507a776743d5'
        }
      ]
    }
  ],
  last_seq: '1-C1J',
  pending: 0
};

Deno.test("should get a streamed list of changes - GET /_changes - nano.db.changesAsStream", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  return new Promise(async (resolve, reject) => {
    let responseArray: Uint8Array = new Uint8Array([]);
    const db = nano.db.use('db');
    const stream = await db.changesAsStream();
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

Deno.test("should get a streamed list of changes with opts - GET /_changes - nano.db.changesAsStream", async () => {
  const opts = { include_docs: true }
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  return new Promise(async (resolve, reject) => {
    let responseArray: Uint8Array = new Uint8Array([]);
    const db = nano.db.use('db');
    const stream = await db.changesAsStream(opts);
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
