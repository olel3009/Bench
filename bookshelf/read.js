import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

export let options = { vus: 1, duration: "600s" };

export let totalOps = new Counter("total_operations");
export let readDuration = new Trend("read_duration");

export function setup() {
    http.post("http://localhost:3002/api/bookshelf/db/create", null, { tags: { operation: "setup_db" } });

    let res = http.post("http://localhost:3002/api/bookshelf/resource", JSON.stringify({ name: "Test" }), {
        headers: { "Content-Type": "application/json" },
    });
    return { resourceId: JSON.parse(res.body).id };
}

export default function (data) {
    let start = Date.now();
    let res = http.get(`http://localhost:3002/api/bookshelf/resource/${data.resourceId}`, {
        tags: { operation: "bookshelf_read" },
    });
    readDuration.add(Date.now() - start);
    totalOps.add(1);
    check(res, { "Status is 200": (r) => r.status === 200 });
}
