import assert from "node:assert/strict";
import test from "node:test";
import { haversineKm } from "../src/lib/geo.ts";
import {
  nextOccurrence,
  occurrenceOnDate,
  zonedParts,
} from "../src/lib/schedule.ts";

const wednesdayNoonSp = new Date("2026-11-25T15:00:00Z");

test("next mass later the same day in Sao Paulo", () => {
  const at = nextOccurrence(
    { weekday: 3, time: "19:00", weekOfMonth: null },
    wednesdayNoonSp,
  );
  assert.ok(at);
  const parts = zonedParts(at);
  assert.equal(parts.day, 25);
  assert.equal(parts.month, 11);
  assert.equal(parts.hour, 19);
  assert.equal(parts.minute, 0);
});

test("a mass that already happened moves to the next week", () => {
  const at = nextOccurrence(
    { weekday: 3, time: "07:00", weekOfMonth: null },
    wednesdayNoonSp,
  );
  assert.ok(at);
  const parts = zonedParts(at);
  assert.equal(parts.year, 2026);
  assert.equal(parts.month, 12);
  assert.equal(parts.day, 2);
  assert.equal(parts.hour, 7);
});

test("first Friday of the month skips a Friday that is not the first", () => {
  const at = nextOccurrence(
    { weekday: 5, time: "15:00", weekOfMonth: 1 },
    wednesdayNoonSp,
  );
  assert.ok(at);
  const parts = zonedParts(at);
  assert.equal(parts.month, 12);
  assert.equal(parts.day, 4);
  assert.equal(parts.hour, 15);
});

test("a chosen day returns only that calendar date", () => {
  const hit = occurrenceOnDate(
    { weekday: 0, time: "10:30", weekOfMonth: null },
    2026,
    11,
    29,
  );
  assert.ok(hit);
  assert.equal(zonedParts(hit).weekday, 0);
  assert.equal(
    occurrenceOnDate({ weekday: 1, time: "07:00", weekOfMonth: null }, 2026, 11, 29),
    null,
  );
});

test("distance is symmetric and small inside the center", () => {
  const cathedral = { lat: -23.31206, lng: -51.15955 };
  const coracao = { lat: -23.319495, lng: -51.165737 };
  const going = haversineKm(cathedral, coracao);
  const back = haversineKm(coracao, cathedral);
  assert.ok(Math.abs(going - back) < 0.001);
  assert.ok(going > 0.5 && going < 2);
});
