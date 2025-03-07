import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

export let options = {
    vus: 1,
    duration: "600s",
};

// Definiere benutzerdefinierte Metriken:
export let totalOps = new Counter("total_operations");
export let createDuration = new Trend("create_duration");

export function setup() {
    http.post("http://localhost:3004/api/rawsql/db/create", null, {
        tags: { operation: "setup_db" },
    });
}

export default function () {
    let start = Date.now();
    let res = http.post(
        "http://localhost:3004/api/rawsql/resource",
        JSON.stringify({ name: "Test" }),
        {
            headers: { "Content-Type": "application/json" },
            tags: { operation: "rawsql_create" },
        }
    );
    let duration = Date.now() - start;
    createDuration.add(duration);
    totalOps.add(1);
    check(res, { "Status is 201": (r) => r.status === 201 });
}

export function teardown() {
    http.del("http://localhost:3004/api/rawsql/db/drop", null, {
        tags: { operation: "teardown_db" },
    });
}
