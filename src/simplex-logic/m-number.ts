// Represents numbers of the form: constant + mCoeff * M
export class MNumber {
  constant: number;
  mCoeff: number;

  constructor(constant = 0, mCoeff = 0) {
    this.constant = constant;
    this.mCoeff = mCoeff;
  }

  // Static methods for operations
  static add(a: MNumber, b: MNumber): MNumber {
    return new MNumber(a.constant + b.constant, a.mCoeff + b.mCoeff);
  }

  static subtract(a: MNumber, b: MNumber): MNumber {
    return new MNumber(a.constant - b.constant, a.mCoeff - b.mCoeff);
  }

  static multiply(mNum: MNumber, scalar: number): MNumber {
    // Only handles multiplication by a regular number (scalar)
    if (typeof scalar !== "number") {
      console.error("MNumber multiplication only supports scalar numbers.");
      return mNum; // Or throw error
    }
    return new MNumber(mNum.constant * scalar, mNum.mCoeff * scalar);
  }

  static compare(a: MNumber, b: MNumber): number {
    // Compares a and b, returns > 0 if a > b, < 0 if a < b, 0 if a == b
    // Assumes M is very large and positive
    if (a.mCoeff !== b.mCoeff) {
      return a.mCoeff - b.mCoeff;
    }
    // If M coefficients are equal, compare constants
    return a.constant - b.constant;
  }

  toString(): string {
    if (this.mCoeff === 0) {
      return `${this.constant}`;
    }
    const constPart = this.constant !== 0 ? `${this.constant}` : "";
    const mPart =
      Math.abs(this.mCoeff) === 1
        ? this.mCoeff > 0
          ? "M"
          : "-M"
        : `${this.mCoeff}M`;
    const sign = this.constant !== 0 && this.mCoeff > 0 ? "+" : "";

    if (this.constant === 0) return mPart;
    if (this.mCoeff < 0) return `${this.constant}${mPart}`; // sign is already included

    return `${constPart}${sign}${mPart}`;
  }

  isPositive(): boolean {
    // Check if the MNumber is definitively positive assuming large M
    if (this.mCoeff > 0) return true;
    if (this.mCoeff < 0) return false;
    return this.constant > 0;
  }

  isZero(): boolean {
    return this.constant === 0 && this.mCoeff === 0;
  }
}
