export const GET_SHOP_DEFAULT_CURRENCY_CODE = `
query getShopDefaultCurrencyCode {
  shop {
    currencyCode
  }
}`

export const FETCH_SHOP_SETTINGS = `
  query SettingsGeneral {
    shop {
      id
      ianaTimezone
      timezoneAbbreviation
      timezoneOffset
      timezoneOffsetMinutes
    }
  }
`;



