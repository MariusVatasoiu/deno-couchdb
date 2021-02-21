import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to access a MapReduce view with a list as a stream - GET /db/_design/ddoc/_list/listname/viewname - db.viewWithListAsStream", async () => {
  const response = {
    rows: [
      { key: null, value: 23515 }
    ]
  };

  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  return new Promise(async (resolve, reject) => {
    let responseArray: Uint8Array = new Uint8Array([]);
    const db = nano.db.use('db');
    const stream = await db.viewWithListAsStream('ddoc', 'viewname', 'listname');
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