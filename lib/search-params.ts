import { parseAsString, parseAsInteger, parseAsStringLiteral } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const courtCatalogParsers = {
  search: parseAsString.withDefault(""),
  type: parseAsStringLiteral(["ALL", "FUTSAL", "BADMINTON"] as const).withDefault("ALL"),
};
export const courtCatalogSearchParamsCache = createSearchParamsCache(courtCatalogParsers);

export const adminReservationsParsers = {
  filter: parseAsStringLiteral(["all", "daily", "monthly"] as const).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};
export const adminReservationsSearchParamsCache = createSearchParamsCache(adminReservationsParsers);

export const adminCustomersParsers = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};
export const adminCustomersSearchParamsCache = createSearchParamsCache(adminCustomersParsers);

export const adminCourtsParsers = {
  tab: parseAsStringLiteral(["all", "active", "inactive"] as const).withDefault("all"),
  search: parseAsString.withDefault(""),
};
export const adminCourtsSearchParamsCache = createSearchParamsCache(adminCourtsParsers);

export const reservationListParsers = {
  status: parseAsStringLiteral(["ALL", "DP_PAID", "PENDING", "CANCELED"] as const).withDefault("ALL"),
};
export const reservationListSearchParamsCache = createSearchParamsCache(reservationListParsers);
