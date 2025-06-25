// noinspection JSUnusedGlobalSymbols

import {
  format,
  subDays,
  differenceInCalendarDays,
  toDate,
  parse,
  isBefore,
  isAfter,
  addDays,
  isPast,
  addMonths,
  addYears,
  endOfDay,
  isEqual,
  isValid,
  parseISO,
} from 'date-fns';

export class DateUtils {
  static readonly DATE_FORMAT = 'MM/dd/yyyy';
  static readonly DATE_FORMAT_CALENDAR = 'MM/dd/yyyy';

  /**
   * Checks if date1 is before date2
   *
   * @static
   * @param {Date | string} date1
   * @param {Date | string} date2
   * @returns {boolean}
   *
   * @memberOf DateUtils
   */
  static isBefore(
      date1: Date | string | undefined,
      date2: Date | string | undefined
  ): boolean {
    const parsedDate1 = DateUtils.handleStringOrDate(date1);
    const parsedDate2 = DateUtils.handleStringOrDate(date2);

    if (!parsedDate1 || !parsedDate2) {
      return false;
    }

    return isBefore(parsedDate1, parsedDate2);
  }

  /**
   * Checks if date1 is after date2
   *
   * @static
   * @param {Date | string} date1
   * @param {Date | string} date2
   * @returns {boolean}
   *
   * @memberOf DateUtils
   */
  static isAfter(
      date1: Date | string | undefined,
      date2: Date | string | undefined
  ): boolean {
    const parsedDate1 = DateUtils.handleStringOrDate(date1);
    const parsedDate2 = DateUtils.handleStringOrDate(date2);

    if (!parsedDate1 || !parsedDate2) {
      return false;
    }

    return isAfter(parsedDate1, parsedDate2);
  }

  /**
   * Checks if date is in the past
   *
   * @static
   * @param {Date} date
   * @returns {boolean}
   *
   * @memberOf DateUtils
   */
  static isDateInPast(date: Date | string): boolean {
    const parsedDate = DateUtils.handleStringOrDate(date);
    if (!parsedDate) {
      return false;
    }
    return isPast(parsedDate);
  }

  static addDays(date: Date | string, numberOfDays: number): Date {
    const parsedDate = DateUtils.handleStringOrDate(date);
    if (!parsedDate) {
      throw new Error('Invalid date provided to addDays');
    }
    return addDays(parsedDate, numberOfDays);
  }

  static subtractDays(date: Date | string, numberOfDays: number): Date {
    const parsedDate = DateUtils.handleStringOrDate(date);
    if (!parsedDate) {
      throw new Error('Invalid date provided to subtractDays');
    }
    return subDays(parsedDate, numberOfDays);
  }

  static daysInBetween(date1: Date | string, date2: Date | string): number {
    const parsedDate1 = DateUtils.handleStringOrDate(date1);
    const parsedDate2 = DateUtils.handleStringOrDate(date2);

    if (!parsedDate1 || !parsedDate2) {
      return 0;
    }

    return differenceInCalendarDays(parsedDate1, parsedDate2);
  }

  static addMonths(date: Date | string, numberOfMonths: number): Date {
    const parsedDate = DateUtils.handleStringOrDate(date);
    if (!parsedDate) {
      throw new Error('Invalid date provided to addMonths');
    }
    return addMonths(parsedDate, numberOfMonths);
  }

  static addYears(date: Date | string, numberOfYears: number): Date {
    const parsedDate = DateUtils.handleStringOrDate(date);
    if (!parsedDate) {
      throw new Error('Invalid date provided to addYears');
    }
    return addYears(parsedDate, numberOfYears);
  }

  static equals(date1: Date | string, date2: Date | string): boolean {
    const parsedDate1 = DateUtils.handleStringOrDate(date1);
    const parsedDate2 = DateUtils.handleStringOrDate(date2);

    if (!parsedDate1 || !parsedDate2) {
      return false;
    }

    return isEqual(parsedDate1, parsedDate2);
  }

  /**
   *
   * Formats a date as per the given format
   * @param {Date} date or string or milliseconds from epoch
   * @param {string} [formatStr] defaults to "MM/DD/YYYY"
   * @returns {string} formatted date
   */
  static formatDate(date: Date | string | number, formatStr?: string): string {
    let localFormat = formatStr ? formatStr : DateUtils.DATE_FORMAT;
    const dt = DateUtils.handleStringOrDate(date);
    return dt && isValid(dt) ? format(dt, localFormat) : '';
  }

  static formatISODate(date: string, formatStr?: string): string {
    let localFormat = formatStr ? formatStr : DateUtils.DATE_FORMAT;
    const dt = parseISO(date);
    return dt && isValid(dt) ? format(dt, localFormat) : '';
  }

  /**
   *
   * Parses a string as per the given format
   * @param {string} value
   * @param {string} [formatStr] defaults to "MM/DD/YYYY"
   * @returns {Date}
   */
  static parseDate(
      value: string,
      formatStr = DateUtils.DATE_FORMAT
  ): Date | undefined {
    if (value) {
      return parse(value, formatStr, new Date());
    }
    return undefined;
  }

  static isMissing(date: Date): boolean {
    return typeof date === 'undefined' || date === null;
  }

  /**
   * handles parsing of date if given date is a string.
   * Always returns the same timestamp (23:59:59) for all valid dates,
   * so that any comparison is done based on the date part alone
   *
   * @private
   * @static
   * @param {(Date | string | number)} date
   * @returns {(Date | undefined)}
   * @memberof DateUtils
   */
  private static handleStringOrDate(
      date: Date | string | number | undefined
  ): Date | undefined {
    if (date === undefined || date === null) {
      return undefined;
    }

    if (typeof date === 'string') {
      const dt = DateUtils.parseDate(date);
      return typeof dt === 'undefined' ? undefined : endOfDay(dt);
    }
    return endOfDay(toDate(date));
  }
}