export interface GeoInfo {
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
}

export const SUPPORTED_CURRENCIES = [
  "NGN", "GHS", "KES", "UGX", "ZMW", "TZS", "ZAR", "USD", "EUR", "XOF", "XAF"
];

export const ALL_COUNTRY_CURRENCY_MAP: Record<string, { currency: string; symbol: string; name: string }> = {
  AF: { currency: "AFN", symbol: "؋", name: "Afghanistan" },
  AL: { currency: "ALL", symbol: "L", name: "Albania" },
  DZ: { currency: "DZD", symbol: "دج", name: "Algeria" },
  AO: { currency: "AOA", symbol: "Kz", name: "Angola" },
  AR: { currency: "ARS", symbol: "$", name: "Argentina" },
  AM: { currency: "AMD", symbol: "֏", name: "Armenia" },
  AU: { currency: "USD", symbol: "$", name: "Australia" },
  AT: { currency: "EUR", symbol: "€", name: "Austria" },
  AZ: { currency: "AZN", symbol: "₼", name: "Azerbaijan" },
  BH: { currency: "USD", symbol: "$", name: "Bahrain" },
  BD: { currency: "USD", symbol: "$", name: "Bangladesh" },
  BY: { currency: "USD", symbol: "$", name: "Belarus" },
  BE: { currency: "EUR", symbol: "€", name: "Belgium" },
  BJ: { currency: "XOF", symbol: "CFA", name: "Benin" },
  BO: { currency: "USD", symbol: "$", name: "Bolivia" },
  BA: { currency: "EUR", symbol: "€", name: "Bosnia" },
  BW: { currency: "USD", symbol: "$", name: "Botswana" },
  BR: { currency: "USD", symbol: "$", name: "Brazil" },
  BN: { currency: "USD", symbol: "$", name: "Brunei" },
  BG: { currency: "EUR", symbol: "€", name: "Bulgaria" },
  BF: { currency: "XOF", symbol: "CFA", name: "Burkina Faso" },
  BI: { currency: "USD", symbol: "$", name: "Burundi" },
  CV: { currency: "USD", symbol: "$", name: "Cabo Verde" },
  CM: { currency: "XAF", symbol: "FCFA", name: "Cameroon" },
  CA: { currency: "USD", symbol: "$", name: "Canada" },
  CF: { currency: "XAF", symbol: "FCFA", name: "Central African Republic" },
  TD: { currency: "XAF", symbol: "FCFA", name: "Chad" },
  CL: { currency: "USD", symbol: "$", name: "Chile" },
  CN: { currency: "USD", symbol: "$", name: "China" },
  CO: { currency: "USD", symbol: "$", name: "Colombia" },
  KM: { currency: "USD", symbol: "$", name: "Comoros" },
  CG: { currency: "XAF", symbol: "FCFA", name: "Congo" },
  CD: { currency: "USD", symbol: "$", name: "DR Congo" },
  CR: { currency: "USD", symbol: "$", name: "Costa Rica" },
  CI: { currency: "XOF", symbol: "CFA", name: "Côte d'Ivoire" },
  HR: { currency: "EUR", symbol: "€", name: "Croatia" },
  CU: { currency: "USD", symbol: "$", name: "Cuba" },
  CY: { currency: "EUR", symbol: "€", name: "Cyprus" },
  CZ: { currency: "EUR", symbol: "€", name: "Czech Republic" },
  DK: { currency: "EUR", symbol: "€", name: "Denmark" },
  DJ: { currency: "USD", symbol: "$", name: "Djibouti" },
  DO: { currency: "USD", symbol: "$", name: "Dominican Republic" },
  EC: { currency: "USD", symbol: "$", name: "Ecuador" },
  EG: { currency: "USD", symbol: "$", name: "Egypt" },
  SV: { currency: "USD", symbol: "$", name: "El Salvador" },
  GQ: { currency: "XAF", symbol: "FCFA", name: "Equatorial Guinea" },
  ER: { currency: "USD", symbol: "$", name: "Eritrea" },
  EE: { currency: "EUR", symbol: "€", name: "Estonia" },
  SZ: { currency: "USD", symbol: "$", name: "Eswatini" },
  ET: { currency: "USD", symbol: "$", name: "Ethiopia" },
  FJ: { currency: "USD", symbol: "$", name: "Fiji" },
  FI: { currency: "EUR", symbol: "€", name: "Finland" },
  FR: { currency: "EUR", symbol: "€", name: "France" },
  GA: { currency: "XAF", symbol: "FCFA", name: "Gabon" },
  GM: { currency: "USD", symbol: "$", name: "Gambia" },
  GE: { currency: "USD", symbol: "$", name: "Georgia" },
  DE: { currency: "EUR", symbol: "€", name: "Germany" },
  GH: { currency: "GHS", symbol: "₵", name: "Ghana" },
  GR: { currency: "EUR", symbol: "€", name: "Greece" },
  GT: { currency: "USD", symbol: "$", name: "Guatemala" },
  GN: { currency: "USD", symbol: "$", name: "Guinea" },
  GW: { currency: "XOF", symbol: "CFA", name: "Guinea-Bissau" },
  GY: { currency: "USD", symbol: "$", name: "Guyana" },
  HT: { currency: "USD", symbol: "$", name: "Haiti" },
  HN: { currency: "USD", symbol: "$", name: "Honduras" },
  HU: { currency: "EUR", symbol: "€", name: "Hungary" },
  IS: { currency: "EUR", symbol: "€", name: "Iceland" },
  IN: { currency: "USD", symbol: "$", name: "India" },
  ID: { currency: "USD", symbol: "$", name: "Indonesia" },
  IR: { currency: "USD", symbol: "$", name: "Iran" },
  IQ: { currency: "USD", symbol: "$", name: "Iraq" },
  IE: { currency: "EUR", symbol: "€", name: "Ireland" },
  IL: { currency: "USD", symbol: "$", name: "Israel" },
  IT: { currency: "EUR", symbol: "€", name: "Italy" },
  JM: { currency: "USD", symbol: "$", name: "Jamaica" },
  JP: { currency: "USD", symbol: "$", name: "Japan" },
  JO: { currency: "USD", symbol: "$", name: "Jordan" },
  KZ: { currency: "USD", symbol: "$", name: "Kazakhstan" },
  KE: { currency: "KES", symbol: "KSh", name: "Kenya" },
  KW: { currency: "USD", symbol: "$", name: "Kuwait" },
  KG: { currency: "USD", symbol: "$", name: "Kyrgyzstan" },
  LA: { currency: "USD", symbol: "$", name: "Laos" },
  LV: { currency: "EUR", symbol: "€", name: "Latvia" },
  LB: { currency: "USD", symbol: "$", name: "Lebanon" },
  LS: { currency: "USD", symbol: "$", name: "Lesotho" },
  LR: { currency: "USD", symbol: "$", name: "Liberia" },
  LY: { currency: "USD", symbol: "$", name: "Libya" },
  LT: { currency: "EUR", symbol: "€", name: "Lithuania" },
  LU: { currency: "EUR", symbol: "€", name: "Luxembourg" },
  MG: { currency: "USD", symbol: "$", name: "Madagascar" },
  MW: { currency: "USD", symbol: "$", name: "Malawi" },
  MY: { currency: "USD", symbol: "$", name: "Malaysia" },
  MV: { currency: "USD", symbol: "$", name: "Maldives" },
  ML: { currency: "XOF", symbol: "CFA", name: "Mali" },
  MT: { currency: "EUR", symbol: "€", name: "Malta" },
  MR: { currency: "USD", symbol: "$", name: "Mauritania" },
  MU: { currency: "USD", symbol: "$", name: "Mauritius" },
  MX: { currency: "USD", symbol: "$", name: "Mexico" },
  MD: { currency: "USD", symbol: "$", name: "Moldova" },
  MN: { currency: "USD", symbol: "$", name: "Mongolia" },
  ME: { currency: "EUR", symbol: "€", name: "Montenegro" },
  MA: { currency: "USD", symbol: "$", name: "Morocco" },
  MZ: { currency: "USD", symbol: "$", name: "Mozambique" },
  MM: { currency: "USD", symbol: "$", name: "Myanmar" },
  NA: { currency: "USD", symbol: "$", name: "Namibia" },
  NP: { currency: "USD", symbol: "$", name: "Nepal" },
  NL: { currency: "EUR", symbol: "€", name: "Netherlands" },
  NZ: { currency: "USD", symbol: "$", name: "New Zealand" },
  NI: { currency: "USD", symbol: "$", name: "Nicaragua" },
  NE: { currency: "XOF", symbol: "CFA", name: "Niger" },
  NG: { currency: "NGN", symbol: "₦", name: "Nigeria" },
  MK: { currency: "EUR", symbol: "€", name: "North Macedonia" },
  NO: { currency: "EUR", symbol: "€", name: "Norway" },
  OM: { currency: "USD", symbol: "$", name: "Oman" },
  PK: { currency: "USD", symbol: "$", name: "Pakistan" },
  PA: { currency: "USD", symbol: "$", name: "Panama" },
  PG: { currency: "USD", symbol: "$", name: "Papua New Guinea" },
  PY: { currency: "USD", symbol: "$", name: "Paraguay" },
  PE: { currency: "USD", symbol: "$", name: "Peru" },
  PH: { currency: "USD", symbol: "$", name: "Philippines" },
  PL: { currency: "EUR", symbol: "€", name: "Poland" },
  PT: { currency: "EUR", symbol: "€", name: "Portugal" },
  QA: { currency: "USD", symbol: "$", name: "Qatar" },
  RO: { currency: "EUR", symbol: "€", name: "Romania" },
  RU: { currency: "USD", symbol: "$", name: "Russia" },
  RW: { currency: "USD", symbol: "$", name: "Rwanda" },
  SA: { currency: "USD", symbol: "$", name: "Saudi Arabia" },
  SN: { currency: "XOF", symbol: "CFA", name: "Senegal" },
  RS: { currency: "EUR", symbol: "€", name: "Serbia" },
  SL: { currency: "USD", symbol: "$", name: "Sierra Leone" },
  SG: { currency: "USD", symbol: "$", name: "Singapore" },
  SK: { currency: "EUR", symbol: "€", name: "Slovakia" },
  SI: { currency: "EUR", symbol: "€", name: "Slovenia" },
  SO: { currency: "USD", symbol: "$", name: "Somalia" },
  ZA: { currency: "ZAR", symbol: "R", name: "South Africa" },
  SS: { currency: "USD", symbol: "$", name: "South Sudan" },
  ES: { currency: "EUR", symbol: "€", name: "Spain" },
  LK: { currency: "USD", symbol: "$", name: "Sri Lanka" },
  SD: { currency: "USD", symbol: "$", name: "Sudan" },
  SR: { currency: "USD", symbol: "$", name: "Suriname" },
  SE: { currency: "EUR", symbol: "€", name: "Sweden" },
  CH: { currency: "EUR", symbol: "€", name: "Switzerland" },
  SY: { currency: "USD", symbol: "$", name: "Syria" },
  TW: { currency: "USD", symbol: "$", name: "Taiwan" },
  TJ: { currency: "USD", symbol: "$", name: "Tajikistan" },
  TZ: { currency: "TZS", symbol: "Sh", name: "Tanzania" },
  TH: { currency: "USD", symbol: "$", name: "Thailand" },
  TG: { currency: "XOF", symbol: "CFA", name: "Togo" },
  TT: { currency: "USD", symbol: "$", name: "Trinidad and Tobago" },
  TN: { currency: "USD", symbol: "$", name: "Tunisia" },
  TR: { currency: "USD", symbol: "$", name: "Turkey" },
  TM: { currency: "USD", symbol: "$", name: "Turkmenistan" },
  UG: { currency: "UGX", symbol: "Sh", name: "Uganda" },
  UA: { currency: "USD", symbol: "$", name: "Ukraine" },
  AE: { currency: "USD", symbol: "$", name: "United Arab Emirates" },
  GB: { currency: "USD", symbol: "$", name: "United Kingdom" },
  US: { currency: "USD", symbol: "$", name: "United States" },
  UY: { currency: "USD", symbol: "$", name: "Uruguay" },
  UZ: { currency: "USD", symbol: "$", name: "Uzbekistan" },
  VE: { currency: "USD", symbol: "$", name: "Venezuela" },
  VN: { currency: "USD", symbol: "$", name: "Vietnam" },
  YE: { currency: "USD", symbol: "$", name: "Yemen" },
  ZM: { currency: "ZMW", symbol: "ZK", name: "Zambia" },
  ZW: { currency: "USD", symbol: "$", name: "Zimbabwe" },
};

export const COUNTRY_CURRENCY_MAP = ALL_COUNTRY_CURRENCY_MAP;

export const getFlagEmoji = (countryCode: string): string => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

export const getFlagUrl = (countryCode: string): string => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

export const SUPPORTED_COUNTRIES = Object.entries(ALL_COUNTRY_CURRENCY_MAP)
  .filter(([, info]) => SUPPORTED_CURRENCIES.includes(info.currency))
  .map(([code, info]) => ({ code, ...info }))
  .sort((a, b) => {
    const priority = ["UG", "KE", "TZ", "NG", "GH", "ZM", "ZA"];
    const ai = priority.indexOf(a.code);
    const bi = priority.indexOf(b.code);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

export const SORTED_COUNTRIES = SUPPORTED_COUNTRIES;

let _cached: GeoInfo | null = null;

export const detectGeo = async (): Promise<GeoInfo> => {
  if (_cached) return _cached;
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const detectedCode: string = data.country_code || "NG";
    const info = ALL_COUNTRY_CURRENCY_MAP[detectedCode];
    const currency = info?.currency || "USD";
    const supportedCurrency = SUPPORTED_CURRENCIES.includes(currency) ? currency : "USD";
    const finalCode = supportedCurrency === currency ? detectedCode : "US";
    const finalInfo = ALL_COUNTRY_CURRENCY_MAP[finalCode] || ALL_COUNTRY_CURRENCY_MAP["US"];
    _cached = {
      countryCode: finalCode,
      countryName: finalInfo.name,
      currency: finalInfo.currency,
      currencySymbol: finalInfo.symbol,
    };
    return _cached;
  } catch {
    _cached = {
      countryCode: "UG",
      countryName: "Uganda",
      currency: "UGX",
      currencySymbol: "Sh",
    };
    return _cached;
  }
};

export const getCurrencySymbol = (currency: string): string => {
  const entry = Object.values(ALL_COUNTRY_CURRENCY_MAP).find(c => c.currency === currency);
  return entry?.symbol || currency;
};
