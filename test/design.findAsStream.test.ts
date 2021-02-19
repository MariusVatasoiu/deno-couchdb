import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to query an index as a stream- POST /db/_find - db.findAsStream", async () => {
  const query = {
    selector: {
      $and: {
        date: {
          $gt: '2018'
        },
        name: 'Susan'
      }
    },
    fields: ['name', 'date', 'orderid']
  };
  const response = {
    docs: [
      { name: 'Susan', date: '2019-01-02', orderid: '4411' },
      { name: 'Susan', date: '2019-01-03', orderid: '8523' }
    ]
  };

  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  return new Promise(async (resolve, reject) => {
    let responseArray: Uint8Array = new Uint8Array([]);
    const db = nano.db.use('db');
    const stream = await db.findAsStream(query);
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
