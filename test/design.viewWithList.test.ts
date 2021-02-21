import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to access a MapReduce view with a list - GET /db/_design/ddoc/_list/listname/viewname - db.viewWithList", async () => {
  const response = '1,2,3\n4,5,6\n7,8,9\n';
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response, new Headers({ 'Content-type': 'text/csv' })));
  
  const db = nano.db.use('db');
  const p = await db.viewWithList('ddoc', 'viewname', 'listname');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});
