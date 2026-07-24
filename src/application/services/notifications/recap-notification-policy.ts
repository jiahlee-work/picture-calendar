import { canCreateRecapForMonth, RecapAvailabilityMode } from "@/application/services/recap/recap-month-list";
import { dayjs } from "@/shared/date/dayjs";

export const MONTHLY_RECAP_NOTIFICATION_KIND = "monthly-recap";
export const MONTHLY_RECAP_NOTIFICATION_IDENTIFIER_PREFIX = "monthly-recap";

const MONTHLY_RECAP_NOTIFICATION_HOUR = 9;
const MONTHLY_RECAP_NOTIFICATION_MINUTE = 0;
const MONTHLY_RECAP_SELECTION_THRESHOLD = 10;

export const MonthlyRecapNotificationDestination = {
  detail: "detail",
  select: "select",
} as const;

export type MonthlyRecapNotificationDestination =
  (typeof MonthlyRecapNotificationDestination)[keyof typeof MonthlyRecapNotificationDestination];

export type MonthlyRecapNotificationWindow = {
  month: string;
  triggerDate: Date;
};

export type MonthlyRecapNotificationPlan = {
  body: string;
  data: MonthlyRecapNotificationPayload;
  destination: MonthlyRecapNotificationDestination;
  identifier: string;
  month: string;
  title: string;
  triggerDate: Date;
};

export type MonthlyRecapNotificationPayload = {
  destination: MonthlyRecapNotificationDestination;
  kind: typeof MONTHLY_RECAP_NOTIFICATION_KIND;
  month: string;
  photoCount: number;
};

export type MonthlyRecapNotificationRoute =
  | { pathname: "/recap" }
  | { params: { month: string }; pathname: "/recap/select" }
  | { params: { month: string; year: string }; pathname: "/recap/[year]/[month]" };

type CreateMonthlyRecapNotificationPlanOptions = {
  availabilityMode?: RecapAvailabilityMode;
  hasSelectedRecap: boolean;
  month: string;
  photoCount: number;
  triggerDate: Date;
};

export function getNextMonthlyRecapNotificationWindow(
  currentDate = dayjs().toDate(),
): MonthlyRecapNotificationWindow {
  const currentMonthTrigger = dayjs(currentDate)
    .startOf("month")
    .hour(MONTHLY_RECAP_NOTIFICATION_HOUR)
    .minute(MONTHLY_RECAP_NOTIFICATION_MINUTE)
    .second(0)
    .millisecond(0);
  const triggerDate = dayjs(currentDate).isBefore(currentMonthTrigger)
    ? currentMonthTrigger
    : currentMonthTrigger.add(1, "month");

  return {
    month: triggerDate.subtract(1, "month").format("YYYY-MM"),
    triggerDate: triggerDate.toDate(),
  };
}

export function createMonthlyRecapNotificationPlan({
  availabilityMode = RecapAvailabilityMode.production,
  hasSelectedRecap,
  month,
  photoCount,
  triggerDate,
}: CreateMonthlyRecapNotificationPlanOptions): MonthlyRecapNotificationPlan | null {
  if (photoCount === 0) {
    return null;
  }

  if (!canCreateRecapForMonth({ availabilityMode, currentDate: triggerDate, month })) {
    return null;
  }

  const destination = hasSelectedRecap || photoCount < MONTHLY_RECAP_SELECTION_THRESHOLD
    ? MonthlyRecapNotificationDestination.detail
    : MonthlyRecapNotificationDestination.select;
  const monthLabel = toKoreanMonthLabel(month);
  const body = destination === MonthlyRecapNotificationDestination.select
    ? `${monthLabel}의 대표 사진 10장을 골라볼까요?`
    : `${monthLabel} 리캡이 준비됐어요.`;

  return {
    body,
    data: {
      destination,
      kind: MONTHLY_RECAP_NOTIFICATION_KIND,
      month,
      photoCount,
    },
    destination,
    identifier: createMonthlyRecapNotificationIdentifier(month),
    month,
    title: "월간 리캡",
    triggerDate,
  };
}

export function parseMonthlyRecapNotificationPayload(
  data: Record<string, unknown>,
): MonthlyRecapNotificationPayload | null {
  if (
    data.kind !== MONTHLY_RECAP_NOTIFICATION_KIND
    || !isMonthKey(data.month)
    || !isMonthlyRecapNotificationDestination(data.destination)
    || typeof data.photoCount !== "number"
  ) {
    return null;
  }

  return {
    destination: data.destination,
    kind: MONTHLY_RECAP_NOTIFICATION_KIND,
    month: data.month,
    photoCount: data.photoCount,
  };
}

export function toMonthlyRecapNotificationRoute(
  plan: Pick<MonthlyRecapNotificationPlan, "destination" | "month">,
): MonthlyRecapNotificationRoute {
  if (plan.destination === MonthlyRecapNotificationDestination.select) {
    return {
      params: {
        month: plan.month,
      },
      pathname: "/recap/select",
    };
  }

  const [year, month] = plan.month.split("-");

  return {
    params: {
      month,
      year,
    },
    pathname: "/recap/[year]/[month]",
  };
}

function createMonthlyRecapNotificationIdentifier(month: string): string {
  return `${MONTHLY_RECAP_NOTIFICATION_IDENTIFIER_PREFIX}:${month}`;
}

function isMonthlyRecapNotificationDestination(
  value: unknown,
): value is MonthlyRecapNotificationDestination {
  return (
    value === MonthlyRecapNotificationDestination.detail
    || value === MonthlyRecapNotificationDestination.select
  );
}

function isMonthKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = dayjs(`${value}-01`);

  return parsed.isValid() && parsed.format("YYYY-MM") === value;
}

function toKoreanMonthLabel(month: string): string {
  return dayjs(`${month}-01`).format("M월");
}
