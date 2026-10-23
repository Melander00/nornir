import { Dayjs, default as dayjs } from 'dayjs';
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import duration from "dayjs/plugin/duration.js";
import isoWeek from "dayjs/plugin/isoWeek.js";
import minMax from "dayjs/plugin/minMax.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Europe/Stockholm")
dayjs.extend(advancedFormat)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(minMax)
dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

const locale: Required<ILocale> = {
  name: 'sv',
  weekdays: 'Söndag_Måndag_Tisdag_Onsdag_Torsdag_Fredag_Lördag'.split('_'),
  weekdaysShort: 'Sön_Mån_Tis_Ons_Tor_Fre_Lör'.split('_'),
  weekdaysMin: 'Sö_Må_Ti_On_To_Fr_Lö'.split('_'),
  months: 'Januari_Februari_Mars_April_Maj_Juni_Juli_Augusti_September_Oktober_November_December'.split('_'),
  monthsShort: 'Jan_Feb_Mar_Apr_Maj_Jun_Jul_Aug_Sep_Okt_Nov_Dec'.split('_'),
  weekStart: 1,
  //   yearStart: 4,
  ordinal: (n) => {
    const b = n % 10
    const o = ((b === 1) || (b === 2)) && (n !== 11 && n !== 12) ? ':a' : ':e'
    return `[${n}${o}]`
  },
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY-MM-DD',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY [kl.] HH:mm',
    LLLL: 'dddd D MMMM YYYY [kl.] HH:mm',
    // lll: 'D MMM YYYY HH:mm',
    // llll: 'ddd D MMM YYYY HH:mm'
  },
  relativeTime: {
    future: 'om %s',
    past: 'för %s sedan',
    s: 'några sekunder',
    m: 'en minut',
    mm: '%d minuter',
    h: 'en timme',
    hh: '%d timmar',
    d: 'en dag',
    dd: '%d dagar',
    M: 'en månad',
    MM: '%d månader',
    y: 'ett år',
    yy: '%d år'
  }
}


dayjs.locale(locale)

export function HasExpired(date: Date) {
  return dayjs().isAfter(date)
}

export function CreateExpirationDate(daysInFuture: number) {
  return dayjs().add(daysInFuture, "days").toDate()
}

export function Today() {
  return dayjs().toDate()
}

export function DateString(date: Date) {
  return dayjs(date).tz().format("YYYY-MM-DD HH:mm")
}

export const dayts = dayjs

export const SV_locale = { ...locale }

export function MonthString(month: number) {
  return locale.months[month]
}

export function StringToMinutes(str: string): number {
  const [hh, mm] = str.split(":")

  return parseInt(hh)*60 + parseInt(mm)
}

export function DaysSince(timestamp: Date | Dayjs) {
    return Math.floor( dayts.duration(dayts().diff(timestamp)).asDays() )
}