import { toMinutes } from './dates';

/**
 * Places overlapping events of one day side by side.
 * Returns [{ event, col, cols }] where `cols` is the number of columns in the event's overlap cluster.
 */
export function layoutDay(events) {
  const items = events
    .map((event) => ({ event, s: toMinutes(event.start), e: toMinutes(event.end), col: 0 }))
    .sort((a, b) => a.s - b.s || b.e - a.e);

  const result = [];
  let cluster = [];
  let clusterEnd = -1;

  const flush = () => {
    if (!cluster.length) return;
    const colEnds = [];
    cluster.forEach((it) => {
      let c = colEnds.findIndex((end) => end <= it.s);
      if (c === -1) {
        c = colEnds.length;
        colEnds.push(it.e);
      } else {
        colEnds[c] = it.e;
      }
      it.col = c;
    });
    cluster.forEach((it) => result.push({ event: it.event, col: it.col, cols: colEnds.length }));
    cluster = [];
  };

  items.forEach((it) => {
    if (it.s >= clusterEnd) {
      flush();
      clusterEnd = it.e;
    } else {
      clusterEnd = Math.max(clusterEnd, it.e);
    }
    cluster.push(it);
  });
  flush();

  return result;
}
