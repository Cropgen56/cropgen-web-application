import React from "react";

const DETAIL_LABELS = {
  recommendedAction: "Recommended action",
  method: "Method",
  timing: "Timing",
  duration: "Duration",
  waterQuantity: "Water quantity",
  frequency: "Frequency",
  reason: "Reason",
  rainfallProbability: "Rain chance",
  advisory: "Weather advisory",
  temperature: "Temperature",
  humidity: "Humidity",
  riskLevel: "Risk level",
  cause: "Cause",
  focusAreas: "Focus areas",
  whatToCheck: "What to check",
  sustainabilityNote: "Sustainability",
  note: "Note",
  chemical: "Chemical",
  fertilizer: "Fertilizer",
  quantity: "Quantity",
  time: "Time",
};

function formatDetailKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

const VARIANT_STYLES = {
  dark: {
    wrap: "text-white/60",
    label: "text-white/45",
    value: "text-white/75",
    productCard: "border-white/10 bg-[#10271D]/70",
    productTitle: "text-white/90",
    productMeta: "text-white/65",
    productMethod: "text-white/60",
    string: "text-white/60",
  },
  light: {
    wrap: "text-gray-600",
    label: "text-gray-500",
    value: "text-gray-700",
    productCard: "border-gray-200 bg-gray-50",
    productTitle: "text-gray-800",
    productMeta: "text-gray-600",
    productMethod: "text-gray-600",
    string: "text-gray-600",
  },
};

function ScalarDetailRow({ label, value, styles }) {
  if (value == null || String(value).trim() === "") return null;

  return (
    <div className="leading-relaxed">
      <span className={`font-medium ${styles.label}`}>{label}: </span>
      <span className={styles.value}>{String(value)}</span>
    </div>
  );
}

function ProductCard({ product, index, styles }) {
  if (!product || typeof product !== "object") return null;

  const name = product.name || product.productName || `Product ${index + 1}`;

  return (
    <div className={`rounded-lg border px-3 py-2.5 ${styles.productCard}`}>
      <p className={`font-medium ${styles.productTitle}`}>{name}</p>
      {product.dosage && (
        <p className={`mt-1 ${styles.productMeta}`}>📏 {product.dosage}</p>
      )}
      {product.method && (
        <p className={`mt-1 leading-relaxed ${styles.productMethod}`}>
          🚜 {product.method}
        </p>
      )}
    </div>
  );
}

export default function ActivityDetails({ details, variant = "dark" }) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.dark;

  if (details == null) return null;

  if (typeof details === "string" && details.trim()) {
    return (
      <p className={`mt-2 text-xs leading-relaxed ${styles.string}`}>
        {details}
      </p>
    );
  }

  if (typeof details !== "object" || Array.isArray(details)) return null;

  const { products, ...rest } = details;
  const scalarEntries = Object.entries(rest).filter(
    ([, value]) => value != null && String(value).trim() !== "",
  );

  const hasProducts = Array.isArray(products) && products.length > 0;
  if (!hasProducts && scalarEntries.length === 0) return null;

  return (
    <div className={`mt-2 space-y-2 text-xs ${styles.wrap}`}>
      {hasProducts && (
        <div className="space-y-2">
          {products.map((product, index) => (
            <ProductCard
              key={`${product?.name || "product"}-${index}`}
              product={product}
              index={index}
              styles={styles}
            />
          ))}
        </div>
      )}

      {scalarEntries.map(([key, value]) => (
        <ScalarDetailRow
          key={key}
          label={DETAIL_LABELS[key] || formatDetailKey(key)}
          value={value}
          styles={styles}
        />
      ))}
    </div>
  );
}
