import worldCountries from "world-countries";
import { worldCountryDialCode } from "./phone";

const dialOf = (iso2) =>
  worldCountryDialCode(worldCountries.find((c) => c.cca2 === iso2));

describe("worldCountryDialCode", () => {
  test.each([
    ["IN", "91"],
    ["GB", "44"],
    ["AE", "971"],
    ["NP", "977"],
    ["ZA", "27"],
  ])("%s → +%s (single area-code suffix)", (iso2, code) => {
    expect(dialOf(iso2)).toBe(code);
  });

  test.each([
    ["US", "1"],
    ["CA", "1"],
    ["PR", "1"],
    ["DO", "1"],
    ["RU", "7"],
    ["KZ", "7"],
    ["VA", "39"],
    ["SH", "290"],
    ["EH", "212"],
    ["UM", "1"],
    ["AX", "358"],
  ])("%s → +%s, not the first area code", (iso2, code) => {
    expect(dialOf(iso2)).toBe(code);
  });
});
