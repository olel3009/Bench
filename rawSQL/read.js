import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

export let options = {
    vus: 1,
    duration: "60s",
};

// Benutzerdefinierte Metriken:
export let totalOps = new Counter("total_operations");
export let readDuration = new Trend("read_duration");

export function setup() {
    http.post("http://localhost:3001/api/rawsql/db/create", null, {
        tags: { operation: "setup_db" },
    });

    let res = http.post(
        "http://localhost:3001/api/rawsql/resource",
        JSON.stringify({ name: "Test" }),
        { headers: { "Content-Type": "application/json" } }
    );
    let data = JSON.parse(res.body);
    return { resourceId: data.id };
}

export default function (data) {
    let start = Date.now();
    let res = http.get(`http://localhost:3001/api/rawsql/resource/${data.resourceId}`, {
        tags: { operation: "rawsql_read" },
    });
    let duration = Date.now() - start;
    readDuration.add(duration);
    totalOps.add(1);
    check(res, { "Status is 200": (r) => r.status === 200 });
}

export function teardown() {
    http.del("http://localhost:3001/api/rawsql/db/drop", null, {
        tags: { operation: "teardown_db" },
    });
}
