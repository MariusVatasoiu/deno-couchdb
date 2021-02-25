import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const multipartResponse = ''.concat(
  '--e89b3e29388aef23453450d10e5aaed0',
  'Content-Type: application/json',
  '',
  '{"_id":"secret","_rev":"2-c1c6c44c4bc3c9344b037c8690468605","_attachments":{"recipe.txt":{"content_type":"text/plain","revpos":2,"digest":"md5-HV9aXJdEnu0xnMQYTKgOFA==","length":86,"follows":true}}}',
  '--e89b3e29388aef23453450d10e5aaed0',
  'Content-Disposition: attachment; filename="recipe.txt"',
  'Content-Type: text/plain',
  'Content-Length: 86',
  '',
  '1. Take R',
  '2. Take E',
  '3. Mix with L',
  '4. Add some A',
  '5. Serve with X',
  '',
  '--e89b3e29388aef23453450d10e5aaed0--')

Deno.test("should be able to fetch a document with attachments - multipart GET /db - db.multipart.get", async () => {
  const response = { _id: 'id', rev: '1-123', a: 1, b: 'two', c: true };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, multipartResponse, new Headers({ 'content-type': 'multipart/related; boundary="e89b3e29388aef23453450d10e5aaed0"' })));
  
  const db = nano.db.use('db');
  const p = await db.multipart.get('docid');

  assertEquals(p.toString(), multipartResponse);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should be able to fetch a document with attachments with opts - multipart GET /db - db.multipart.get", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, multipartResponse, new Headers({ 'content-type': 'multipart/related; boundary="e89b3e29388aef23453450d10e5aaed0"' })));
  
  const db = nano.db.use('db');
  const p = await db.get('partkey:id');

  assertEquals(p.toString(), multipartResponse);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should be able to handle 404 - db.multipart.get", async () => {
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.multipart.get('docid'), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should detect missing docName - db.multipart.get", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.multipart.get(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.multipart.get(''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.multipart.get(undefined, { conflicts: true }), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.multipart.get", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.multipart.get(undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
