import { parseAsString, parseAsInteger, parseAsStringLiteral } from "nuqs";

export const courtCatalogParsers = {
  search: parseAsString.withDefault(""),
  type: parseAsStringLiteral(["ALL", "FUTSAL", "BADMINTON"] as const).withDefault("ALL"),
};

export const adminReservationsParsers = {
  filter: parseAsStringLiteral(["all", "daily", "monthly"] as const).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

export const adminCustomersParsers = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export const adminCourtsParsers = {
  tab: parseAsStringLiteral(["all", "active", "inactive"] as const).withDefault("all"),
  search: parseAsString.withDefault(""),
};

export const reservationListParsers = {
  status: parseAsStringLiteral(["ALL", "DP_PAID", "PENDING", "CANCELED"] as const).withDefault("ALL"),
};
