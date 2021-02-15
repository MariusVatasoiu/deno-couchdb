import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib2/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const image = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));

Deno.test("should be able to get an attachment as a stream - GET /db/id/attname - db.attachment.getAsStream", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, image, new Headers({ 'content-type': 'image/gif' })));

  return new Promise(async (resolve, reject) => {
    const db = nano.db.use('db');
    let responseArray: any[] = [];
    const stream = await db.attachment.getAsStream('id', 'transparent.gif');
    const reader = stream.getReader();

    reader.read().then(function processStream({ done, value }: {done: boolean, value: any}) {
      if (done) {
        if(value) {
          responseArray = [...responseArray, ...value];
        }

        assertEquals(responseArray, image);
        fetchStub.restore();
        resolve();
        return;
      }

      responseArray = [...responseArray, ...value];
  
      // Read some more, and call this function again
      return reader.read().then(processStream);
    });
  });
});

Deno.test("should emit an error when stream attachment does not exist - GET /db/id/attname - db.attachment.getAsStream", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, 'Object Not Found', new Headers({ 'content-type': 'application/json' })));

  return new Promise(async (resolve, reject) => {
    const db = nano.db.use('db');
    try {
      await db.attachment.getAsStream('id', 'transparent.gif');
    } catch (err) {
      assertEquals(err.statusCode, 404);
      resolve();
    } finally {
      fetchStub.restore();
    }
  });
});

