/** Enterprise plan copy shared by the pricing dialog and the Settings pricing page. */
export const ENTERPRISE_NAME = "Enterprise";
export const ENTERPRISE_TAGLINE = "Above 500 Ha, customized solutions";
export const ENTERPRISE_PRICING = [
  { label: "Monthly", value: "Custom" },
  { label: "Yearly", value: "Custom" },
];
export const ENTERPRISE_CONTACT_URL = "https://www.cropgenapp.com/contact";

export function openEnterpriseContact() {
  window.open(ENTERPRISE_CONTACT_URL, "_blank", "noopener,noreferrer");
}
