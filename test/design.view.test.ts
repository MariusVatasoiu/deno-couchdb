import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to access a MapReduce view - GET /db/_design/ddoc/_view/viewname - db.view", async () => {
  const response = {
    rows: [
      { key: null, value: 23515 }
    ]
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.view('ddoc', 'viewname');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should be able to access a MapReduce view with opts - GET /db/_design/ddoc/_view/viewname - db.view", async () => {
  const response = {
    rows: [
      { key: 'BA', value: 21 },
      { key: 'BB', value: 1 },
      { key: 'BD', value: 98 },
      { key: 'BE', value: 184 },
      { key: 'BF', value: 32 },
      { key: 'BG', value: 55 },
      { key: 'BH', value: 8 },
      { key: 'BI', value: 10 },
      { key: 'BJ', value: 29 },
      { key: 'BL', value: 1 },
      { key: 'BM', value: 1 },
      { key: 'BN', value: 4 },
      { key: 'BO', value: 27 },
      { key: 'BQ', value: 1 }
    ]
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.view('ddoc', 'viewname', { group: true, startkey: 'BA', endkey: 'BQ' });

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should be able to access a MapReduce view with keys - POST /db/_design/ddoc/_view/viewname - db.view", async () => {
  const keys = ['BA', 'BD'];
  const response = {
    rows: [
      { key: 'BA', value: 21 },
      { key: 'BB', value: 1 }
    ]
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.view('ddoc', 'viewname', { keys: keys });

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to access a MapReduce view with queries - POST /db/_design/ddoc/_view/viewname - db.view", async () => {
  const opts = {
    queries: [
      {
        keys: [
          'BA',
          'BD'
        ]
      },
      {
        limit: 1,
        skip: 2,
        reduce: false
      }
    ]
  };
  const response = {
    results: [
      {
        rows: [
          { key: 'BA', value: 21 },
          { key: 'BB', value: 1 }
        ]
      },
      {
        total_rows: 23515,
        offset: 2,
        rows: [
          { id: '290594', key: 'AE', value: 1 }
        ]
      }
    ]
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.view('ddoc', 'viewname', opts);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to handle 404 - db.view", async () => {
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.view('ddoc', 'viewname', { group: true, startkey: 'BA', endkey: 'BQ' }), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should detect missing parameters - db.view", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.view(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.view('susan'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.view('susan', ''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.view('', 'susan'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.view", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.view('', '', (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
