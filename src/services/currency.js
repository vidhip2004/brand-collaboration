import axios from "axios";

const COUNTRY_CURRENCY_MAP = {
  India: {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
    name: "Indian Rupee",
  },

  USA: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    name: "US Dollar",
  },

  "United States": {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    name: "US Dollar",
  },

  UK: {
    code: "GBP",
    symbol: "£",
    locale: "en-GB",
    name: "British Pound",
  },

  "United Kingdom": {
    code: "GBP",
    symbol: "£",
    locale: "en-GB",
    name: "British Pound",
  },

  Canada: {
    code: "CAD",
    symbol: "CA$",
    locale: "en-CA",
    name: "Canadian Dollar",
  },

  Australia: {
    code: "AUD",
    symbol: "A$",
    locale: "en-AU",
    name: "Australian Dollar",
  },

  Germany: {
    code: "EUR",
    symbol: "€",
    locale: "de-DE",
    name: "Euro",
  },

  France: {
    code: "EUR",
    symbol: "€",
    locale: "fr-FR",
    name: "Euro",
  },

  Japan: {
    code: "JPY",
    symbol: "¥",
    locale: "ja-JP",
    name: "Japanese Yen",
  },

  UAE: {
    code: "AED",
    symbol: "د.إ",
    locale: "en-AE",
    name: "UAE Dirham",
  },

  "United Arab Emirates": {
    code: "AED",
    symbol: "د.إ",
    locale: "en-AE",
    name: "UAE Dirham",
  },
};

const DEFAULT_CURRENCY = {
  code: "INR",
  symbol: "₹",
  locale: "en-IN",
  name: "Indian Rupee",
};

export const getCurrencyFromCountry = (country) => {
  if (!country) {
    return DEFAULT_CURRENCY;
  }

  const normalizedCountry = String(country)
    .trim()
    .toLowerCase();

  const matchedCountry = Object.keys(
    COUNTRY_CURRENCY_MAP
  ).find(
    (key) =>
      key.toLowerCase() === normalizedCountry
  );

  return matchedCountry
    ? COUNTRY_CURRENCY_MAP[matchedCountry]
    : DEFAULT_CURRENCY;
};

export const getCurrencyCodeFromCountry = (country) => {
  return getCurrencyFromCountry(country).code;
};

export const getCurrencySymbol = (currencyCode) => {
  const currency = Object.values(
    COUNTRY_CURRENCY_MAP
  ).find(
    (item) => item.code === currencyCode
  );

  return currency?.symbol || currencyCode || "₹";
};

export const formatCurrency = (
  amount,
  currencyCode = "INR"
) => {
  if (
    amount === undefined ||
    amount === null ||
    amount === ""
  ) {
    return "Budget not specified";
  }

  const currency = Object.values(
    COUNTRY_CURRENCY_MAP
  ).find(
    (item) => item.code === currencyCode
  ) || DEFAULT_CURRENCY;

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

export const formatCompactCurrency = (
  amount,
  currencyCode = "INR"
) => {
  if (
    amount === undefined ||
    amount === null ||
    amount === ""
  ) {
    return "Budget not specified";
  }

  const value = Number(amount) || 0;
  const symbol = getCurrencySymbol(currencyCode);

  if (value >= 10000000) {
    return `${symbol}${(value / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `${symbol}${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}K`;
  }

  return `${symbol}${value.toLocaleString("en-IN")}`;
};

export const getUserCurrency = (user) => {
  return getCurrencyFromCountry(user?.country);
};


export const convertCurrency = async (
  amount,
  fromCurrency,
  toCurrency
) => {
  if (
    amount === undefined ||
    amount === null
  ) {
    return 0;
  }

  if (
    !fromCurrency ||
    !toCurrency ||
    fromCurrency === toCurrency
  ) {
    return Number(amount) || 0;
  }

  const response = await axios.get(
    "http://localhost:5000/api/currency/convert",
    {
      params: {
        amount,
        from: fromCurrency,
        to: toCurrency,
      },
    }
  );

  return response.data.convertedAmount;
};