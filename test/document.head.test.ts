import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to head a document - HEAD /db/id - db.head", async () => {
  const response = '';
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response, new Headers({ ETag: '1-123' })));
  
  const db = nano.db.use('db');
  const p = await db.head('id');

  assertEquals(p.etag, '1-123');
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'HEAD');
  fetchStub.restore();
});

Deno.test("should be able to head a document with callback - HEAD /db/id - db.head", async () => {
  const response = '';
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response, new Headers({ ETag: '1-123' })));

  return new Promise((resolve, reject) => {
    const db = nano.db.use('db');
    db.head('id', (err: any, data: any, headers: any) => {
      // headers get lowercased

      assertEquals(err === null && typeof err === "object", true);
      assertEquals(headers.etag, '1-123');
      const fetchArg = <Request>fetchStub.calls[0].args[0];
      assertEquals(fetchArg.method, 'HEAD');
      fetchStub.restore();

      resolve();
    });
  });
});

Deno.test("should be able to head a missing document - HEAD /db/id - db.head", async () => {
  const response = '';
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.head('id'), Error , "couch returned 404");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'HEAD');
  fetchStub.restore();
});

Deno.test("should detect missing parameters - db.head", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.head(), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.head", () => {
  return new Promise((resolve, reject) => {
    const db = nano.db.use('db');
    db.head(undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});