export class UtilService {
  static uncapitalize(value: string): string {
    return value.charAt(0).toLowerCase() + value.substring(1);
  }

  static isEmptyObject(emptyOrNotObject: any): boolean {
    return (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.keys(emptyOrNotObject).length === 0 &&
      Object.getPrototypeOf(emptyOrNotObject) === Object.prototype
    );
  }
}
