import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const image1 = Uint8Array.from(atob(''.concat(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAsV',
  'BMVEUAAAD////////////////////////5ur3rEBn////////////////wDBL/',
  'AADuBAe9EB3IEBz/7+//X1/qBQn2AgP/f3/ilpzsDxfpChDtDhXeCA76AQH/v7',
  '/84eLyWV/uc3bJPEf/Dw/uw8bRWmP1h4zxSlD6YGHuQ0f6g4XyQkXvCA36MDH6',
  'wMH/z8/yAwX64ODeh47BHiv/Ly/20dLQLTj98PDXWmP/Pz//39/wGyJ7Iy9JAA',
  'AADHRSTlMAbw8vf08/bz+Pv19jK/W3AAAAg0lEQVR4Xp3LRQ4DQRBD0QqTm4Y5',
  'zMxw/4OleiJlHeUtv2X6RbNO1Uqj9g0RMCuQO0vBIg4vMFeOpCWIWmDOw82fZx',
  'vaND1c8OG4vrdOqD8YwgpDYDxRgkSm5rwu0nQVBJuMg++pLXZyr5jnc1BaH4GT',
  'LvEliY253nA3pVhQqdPt0f/erJkMGMB8xucAAAAASUVORK5CYII=')), c => c.charCodeAt(0));
const image2 = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));
const images = [
  { name: 'logo.jpg', data: image1, content_type: 'image/jpg' },
  { name: 'transparent.gif', data: image2, content_type: 'image/gif' }
];
const doc = {
  a: 1,
  b: 2,
  _attachments: {
    'logo.jpg': {
      follows: true,
      content_type: 'image/jpg',
      length: image1.length
    },
    'transparent.gif': {
      follows: true,
      content_type: 'image/gif',
      length: image2.length
    }
  }
};

Deno.test("should be able to insert a document with attachments #1 - multipart PUT /db/id - db.multipart.insert", async () => {
  const response = { ok: true, id: '8s8g8h8h9', rev: '1-123' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.multipart.insert(doc, images, 'docid');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  fetchStub.restore();
});

Deno.test("should be able to insert a document with attachments #2 - multipart PUT /db/id - db.multipart.insert", async () => {
  const response = { ok: true, id: '8s8g8h8h9', rev: '1-123' }
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.multipart.insert(doc, images, { docName: 'docid' });

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  fetchStub.restore();
});

Deno.test("should be able to handle 404 - db.multipart.insert", async () => {
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.multipart.insert(doc, images, { docName: 'docid' }), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  fetchStub.restore();
});

Deno.test("should detect missing docName - db.multipart.insert", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.multipart.insert(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.multipart.insert({ a: 1 }, [{}]), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.multipart.insert({ a: 1 }, [{}], {}), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.multipart.insert", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.multipart.insert(undefined, undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
