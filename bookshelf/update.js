import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

export let options = { vus: 1, duration: "600s" };

export let totalOps = new Counter("total_operations");
export let updateDuration = new Trend("update_duration");

export function setup() {
    let res = http.post("http://localhost:3002/api/bookshelf/resource", JSON.stringify({ name: "Test" }), {
        headers: { "Content-Type": "application/json" },
    });
    return { resourceId: JSON.parse(res.body).id };
}

export default function (data) {
    let start = Date.now();
    let res = http.put(`http://localhost:3002/api/bookshelf/resource/${data.resourceId}`, JSON.stringify({ name: "Updated Test" }), {
        headers: { "Content-Type": "application/json" },
        tags: { operation: "bookshelf_update" },
    });
    updateDuration.add(Date.now() - start);
    totalOps.add(1);
    check(res, { "Status is 200": (r) => r.status === 200 });
}
