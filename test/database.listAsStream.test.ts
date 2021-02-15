import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib2/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = ['rita', 'sue', 'bob'];

Deno.test("should get a streamed list of databases - GET /_all_dbs - nano.db.listAsStream", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  return new Promise(async (resolve, reject) => {
    let responseArray: Uint8Array = new Uint8Array([]);
    const stream = await nano.db.listAsStream();
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
