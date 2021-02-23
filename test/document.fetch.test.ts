import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to fetch a list of documents - POST /db/_all_docs - db.fetch", async () => {
  const keys = ['1000501', '1000543', '100077'];
  const response = {
    total_rows: 23516,
    offset: 0,
    rows: [
      {
        id: '1000501',
        key: '1000501',
        value: {
          rev: '2-46dcf6bf2f8d428504f5290e591aa182'
        },
        doc: {
          _id: '1000501',
          _rev: '2-46dcf6bf2f8d428504f5290e591aa182',
          a: 1,
          b: 2
        }
      },
      {
        id: '1000543',
        key: '1000543',
        value: {
          rev: '1-3256046064953e2f0fdb376211fe78ab'
        },
        doc: {
          _id: '1000543',
          _rev: '2-3256046064953e2f0fdb376211fe78ab',
          a: 3,
          b: 4
        }
      },
      {
        id: '100077',
        key: '100077',
        value: {
          rev: '1-101bff1251d4bd75beb6d3c232d05a5c'
        },
        doc: {
          _id: '100077',
          _rev: '2-101bff1251d4bd75beb6d3c232d05a5c',
          a: 5,
          b: 6
        }
      }
    ]
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.fetch({ keys: keys });

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to fetch a list of documents with opts - POST /db/_all_docs - db.fetch", async () => {
  const keys = ['1000501', '1000543', '100077']
  const response = {
    total_rows: 23516,
    offset: 0,
    rows: [
      {
        id: '1000501',
        key: '1000501',
        value: {
          rev: '2-46dcf6bf2f8d428504f5290e591aa182'
        },
        doc: {
          _id: '1000501',
          _rev: '2-46dcf6bf2f8d428504f5290e591aa182',
          a: 1,
          b: 2
        }
      },
      {
        id: '1000543',
        key: '1000543',
        value: {
          rev: '1-3256046064953e2f0fdb376211fe78ab'
        },
        doc: {
          _id: '1000543',
          _rev: '2-3256046064953e2f0fdb376211fe78ab',
          a: 3,
          b: 4
        }
      },
      {
        id: '100077',
        key: '100077',
        value: {
          rev: '1-101bff1251d4bd75beb6d3c232d05a5c'
        },
        doc: {
          _id: '100077',
          _rev: '2-101bff1251d4bd75beb6d3c232d05a5c',
          a: 5,
          b: 6
        }
      }
    ]
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.fetch({ keys: keys }, { descending: true });

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to handle 404 - POST /db/_all_docs - db.fetch", async () => {
  const keys = ['1000501', '1000543', '100077']
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.fetch({ keys: keys }), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should detect invalid parameters - db.fetch", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.fetch(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.fetch({}), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.fetch({ keys: {} }), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.fetch({ keys: '123' }), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.fetch({ keys: [] }), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.fetch", () => {
  return new Promise((resolve, reject) => {
    const db = nano.db.use('db');
    db.fetch(undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
