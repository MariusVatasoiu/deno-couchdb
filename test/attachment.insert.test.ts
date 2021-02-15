import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const image = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));

Deno.test("should be able to insert document attachment - PUT /db/docname/attachment - db.attachment.insert", async () => {
  const response = { ok: true, id: 'docname', rev: '2-456' }
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response, new Headers({ 'content-type': 'image/gif' })));

  const db = nano.db.use('db');
  const p = await db.attachment.insert('docname', 'transparent.gif', image, 'image/gif', { rev: '1-150' });
  
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  assertEquals(p, response);

  fetchStub.restore();
});

Deno.test("should be able to handle 404 - db.attachment.insert", async () => {
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  const db = nano.db.use('db');
  
  assertThrowsAsync(async() => await db.attachment.insert('docname', 'transparent.gif', image, 'image/gif', { rev: '1-150' }), Error , "missing");
  fetchStub.restore();
});

Deno.test("should detect missing parameters - db.attachment.inser", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.attachment.insert(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.insert('docname'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.insert('docname', 't.gif'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.insert('docname', 't.gif', image), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.attachment.insert", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.attachment.insert(undefined, undefined, undefined, undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("should be able to insert document attachment as stream - PUT /db/docname/attachment - db.attachment.insert", async () => {
  const response = { ok: true, id: 'docname', rev: '2-456' }
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response, new Headers({ 'content-type': 'image/jpg' })));

  const db = nano.db.use('db');
  const p = await db.attachment.insert('docname', 'logo.jpg', image, 'image/jpg', { rev: '1-150' });
  
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  assertEquals(p, response);

  fetchStub.restore();
});