import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to query an index - POST /db/_find - db.find", async () => {
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
  
  const db = nano.db.use('db');
  const p = await db.find(query);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should handle 404 - POST /db/_find - db.find", async () => {
  const query = {
    selector: {
      name: 'Susan'
    }
  };
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.find(query), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should detect missing query - db.find", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.find(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.find('susan'), Error , "Invalid parameters");
});

Deno.test("should detect missing query (callback) - db.find", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.find('', (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
