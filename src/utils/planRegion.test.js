import { planCurrencyForUser } from "./planRegion";

describe("planCurrencyForUser", () => {
  it("the server's answer wins", () => {
    expect(planCurrencyForUser({ country: "US" }, "INR")).toBe("INR");
    expect(planCurrencyForUser({}, "USD")).toBe("USD");
  });
  it("India by country", () => expect(planCurrencyForUser({ country: "in" })).toBe("INR"));
  it("other countries get USD", () => expect(planCurrencyForUser({ country: "US" })).toBe("USD"));
  it("country wins over the phone prefix", () =>
    expect(planCurrencyForUser({ country: "US", phone: "+919000000000" })).toBe("USD"));
  it("falls back to +91 phone, then USD", () => {
    expect(planCurrencyForUser({ phone: "+919000000000" })).toBe("INR");
    expect(planCurrencyForUser({ phone: "+14155550123" })).toBe("USD");
    expect(planCurrencyForUser(null)).toBe("USD");
  });
});
