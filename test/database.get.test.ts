import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = {
  db_name: 'db',
  purge_seq: '0-8KhNZEiqhyjKAgBm5Rxs',
  update_seq: '23523-gUFPHo-6PQIAJ_EdrA',
  sizes: {
    file: 18215344,
    external: 5099714,
    active: 6727596
  },
  other: {
    data_size: 5099714
  },
  doc_del_count: 23000,
  doc_count: 0,
  disk_size: 18215344,
  disk_format_version: 7,
  data_size: 6727596,
  compact_running: false,
  cluster: {
    q: 2,
    n: 1,
    w: 1,
    r: 1
  },
  instance_start_time: '0'
}

Deno.test("should be able to fetch the database info - GET /db - nano.db.get", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.get('db');
  try{
    assertEquals(typeof p, 'object');
    assertEquals(p.doc_count, 0);
    assertEquals(p.db_name, 'db');
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'GET');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to fetch the database info - GET /db - db.info", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.info();
  try{
    assertEquals(typeof p, 'object');
    assertEquals(p.doc_count, 0);
    assertEquals(p.db_name, 'db');
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'GET');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should handle missing database - GET /db - nano.db.get", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, {
    error: 'not_found',
    reason: 'Database does not exist.'
  }));
  
  assertThrowsAsync(async() => await nano.db.get('db'), Error , "Database does not exist.");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');

  fetchStub.restore();
});

Deno.test("should not attempt info fetch with missing parameters - nano.db.get", async () => {
  assertThrowsAsync(async() => await nano.db.get(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.get(''), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.get", () => {
  return new Promise((resolve, reject) => {
    nano.db.get(undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});