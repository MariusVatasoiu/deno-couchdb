import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = { ok: true, id: 'abc', rev: '1-123' };

Deno.test("should be able to send replication request with local database names - POST /_replicator - nano.db.replication.enable", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.replication.enable('source', 'target');
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  try{
    assertEquals(p, response);
    assertEquals(fetchArg.method, 'POST');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to send replication request with URLs - POST /_replicator - nano.db.replication.enable", async () => {
  const source = 'http://mydomain1.com/source'
  const target = 'https://mydomain2.com/target'
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.replication.enable(source, target)

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');

  fetchStub.restore();
});

Deno.test("should be able to send replication request with URLs - POST /_replicator - nano.db.replication.enable", async () => {
  const source = { config: { url: 'http://mydomain1.com', db: 'source' } };
  const target = { config: { url: 'https://mydomain2.com', db: 'target' } };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.replication.enable(source, target);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');

  fetchStub.restore();
});

Deno.test("should be able to supply additional parameters - POST /_replicator - nano.db.replication.enable", async () => {
  const source = 'http://mydomain1.com/source';
  const target = 'https://mydomain2.com/target';
  const opts = { filter: 'ddoc/func', continuous: true };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.replication.enable(source, target, opts);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');

  fetchStub.restore();
});

Deno.test("should not attempt compact with invalid parameters - nano.db.replication.enable", async () => {
  assertThrowsAsync(async() => await nano.db.replication.enable(undefined, 'target'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replication.enable(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replication.enable('source'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replication.enable('source', ''), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.replication.enable", () => {
  return new Promise((resolve, reject) => {
    nano.db.replication.enable(undefined, undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("should be able to send replication request db.replication.enable - POST /_replicator - db.replication.enable", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  const db = nano.db.use('source');
  const p = await db.replication.enable('target');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');

  fetchStub.restore();
});