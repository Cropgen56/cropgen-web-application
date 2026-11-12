import fs from "fs";
import path from "path";
import {
  FEATURE_DISPLAY_NAMES,
  FEATURE_GATES,
  PLAN_FEATURE_KEYS,
} from "./planFeatures";

const SRC = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(SRC, rel), "utf8");
}

describe("plan feature registry", () => {
  test("every flag has a display name and a gate entry", () => {
    expect(Object.keys(FEATURE_GATES).sort()).toEqual(
      [...PLAN_FEATURE_KEYS].sort(),
    );
    PLAN_FEATURE_KEYS.forEach((k) => expect(FEATURE_DISPLAY_NAMES[k]).toBeTruthy());
  });

  test("matches the server plan schema (when the server repo is present)", () => {
    const schemaPath = path.resolve(
      SRC,
      "../../cropgen-server/src/models/subscription-plan.model.js",
    );
    if (!fs.existsSync(schemaPath)) return;
    const schema = fs.readFileSync(schemaPath, "utf8");
    const block = schema.slice(schema.indexOf("features: {"));
    const serverKeys = [...block.slice(0, block.indexOf("\n    },")).matchAll(/^\s+(\w+): \{ type: Boolean/gm)].map((m) => m[1]);
    expect([...serverKeys].sort()).toEqual([...PLAN_FEATURE_KEYS].sort());
  });

  test("every gated flag is referenced as a featureKey in its screen", () => {
    const sources = [
      "components/dashboard/mapview/MapView.jsx",
      "components/dashboard/crophealth/CropHealthCard.jsx",
      "components/dashboard/forecast/ForeCast.jsx",
      "components/dashboard/satellite-index/VegetationIndex.jsx",
      "components/dashboard/satellite-index/WaterIndex.jsx",
      "components/dashboard/satellite-index/ETChart.jsx",
      "components/dashboard/insights/Insights.jsx",
      "components/dashboard/CropAdvisory.jsx",
      "components/dashboard/PlantGrowthActivity.jsx",
      "pages/Operation.jsx",
      "pages/DiseaseDetection.jsx",
      "pages/SmartAdviosory.jsx",
      "pages/SoilReport.jsx",
      "pages/Weather.jsx",
      "pages/Zoning.jsx",
    ]
      .map(read)
      .join("\n");

    PLAN_FEATURE_KEYS.filter((k) => FEATURE_GATES[k]).forEach((k) => {
      expect(sources).toContain(`featureKey: "${k}"`);
    });
  });

  test("no screen uses an unknown featureKey", () => {
    const files = [
      "components/dashboard",
      "pages",
    ];
    const walk = (dir) =>
      fs.readdirSync(path.join(SRC, dir), { withFileTypes: true }).flatMap((e) =>
        e.name.startsWith("._")
          ? []
          : e.isDirectory()
            ? walk(path.join(dir, e.name))
            : /\.jsx?$/.test(e.name)
              ? [path.join(dir, e.name)]
              : [],
      );
    files.flatMap(walk).forEach((f) => {
      [...read(f).matchAll(/featureKey: "(\w+)"/g)].forEach((m) =>
        expect(PLAN_FEATURE_KEYS).toContain(m[1]),
      );
    });
  });
});
