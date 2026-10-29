import assert from "node:assert/strict";
import test from "node:test";
import { describeWeather } from "../src/utils/weatherConditions.js";

test("clear and partly cloudy icons distinguish day from night", () => {
  assert.equal(describeWeather(0, true).icon, "sun");
  assert.equal(describeWeather(0, false).icon, "moon");
  assert.equal(describeWeather(2, true).icon, "partlyDay");
  assert.equal(describeWeather(2, false).icon, "partlyNight");
});
for (const [codes, icon] of [
  [[3], "cloud"], [[45, 48], "fog"], [[51, 53, 55], "drizzle"],
  [[61, 63, 65, 80, 81, 82], "rain"], [[56, 57, 66, 67], "mixed"],
  [[71, 73, 75, 77, 85, 86], "snow"], [[95, 96, 99], "storm"],
]) {
  test(`${icon} codes map to a matching icon and description`, () => {
    for (const code of codes) {
      assert.equal(describeWeather(code, true).icon, icon);
      assert.ok(describeWeather(code, true).label);
    }
  });
}
test("unknown codes have an explicit generic fallback", () => {
  for (const code of [999, null, undefined]) assert.deepEqual(describeWeather(code, true), { label: "Unknown conditions", icon: "unknown" });
});
