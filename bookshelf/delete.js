import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

export let options = { vus: 1, duration: "600s" };

export let totalOps = new Counter("total_operations");
export let deleteDuration = new Trend("delete_duration");

export default function (data) {
    let start = Date.now();
    let res = http.del(`http://localhost:3001/api/bookshelf/resource/${data.resourceId}`, null, {
        tags: { operation: "bookshelf_delete" },
    });
    deleteDuration.add(Date.now() - start);
    totalOps.add(1);
    check(res, { "Status is 200": (r) => r.status === 200 });
}
