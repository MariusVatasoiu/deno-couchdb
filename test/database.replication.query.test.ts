import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = {
  _id: 'rep1',
  _rev: '2-05a9e090e2bb0977c06b870c870153c5',
  source: 'http://localhost:5984/cities',
  target: 'http://localhost:5984/cities2',
  create_target: true,
  continuous: false,
  owner: 'admin',
  _replication_state: 'completed',
  _replication_state_time: '2019-11-06T13:20:17Z',
  _replication_stats: {
    revisions_checked: 23519,
    missing_revisions_found: 23519,
    docs_read: 23519,
    docs_written: 23519,
    changes_pending: 5127,
    doc_write_failures: 0,
    checkpointed_source_seq: '23523-g1AAAACheJzLYWBgYMpgTmEQTM4vTc5ISXLIyU9OzMnILy7JAUklMiTV____PyuDOYmBQU8-FyjGnphilJRqbIpNDx6T8liAJEMDkPoPN1D3CNhAc2NzU1MzI2xaswBdZzGv',
    start_time: '2019-11-06T13:19:39Z'
  }
};
const errResponse = {
  error: 'not_found',
  reason: 'missing'
};

Deno.test("'should be able to query a replication - GET /_replicator/id - nano.db.replication.query", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.replication.query('rep1');
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  try{
    assertEquals(p, response);
    assertEquals(fetchArg.method, 'GET');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to query a replication with opts - GET /_replicator/id?confilicts=true - nano.db.replication.query", async () => {
  const opts = { conflicts: true };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.replication.query('rep1', opts)

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');

  fetchStub.restore();
});

Deno.test("should be able to query a replication and handle 404 - GET /_replicator/id - nano.db.replication.query", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, errResponse));

  assertThrowsAsync(async() => await nano.db.replication.query('rep1'), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');

  fetchStub.restore();
});

Deno.test("should not attempt info fetch with invalid parameters - nano.db.replication.query", async () => {
  assertThrowsAsync(async() => await nano.db.replication.query(''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replication.query(), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.replication.query", () => {
  return new Promise((resolve, reject) => {
    nano.db.replication.query(undefined, undefined, (err:any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("should be able to query a replication from db.replication.quey - GET /_replicator/id - db.replication.query", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  const db = nano.db.use('db');
  const p = await db.replication.query('rep1');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');

  fetchStub.restore();
});