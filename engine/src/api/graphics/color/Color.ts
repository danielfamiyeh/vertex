import { ColorSpace } from './Color.types';

export class Color {
  type: ColorSpace;
  comps: Array<number>;

  constructor(options: { comps: Array<number>; type: ColorSpace }) {
    const { type, comps } = options;
    this.type = type;
    this.comps = [...comps];
  }

  /**
   * Convert color object to HSV space
   *
   * @returns {Color} Color object in HSV
   */
  RGBToHSV(): Color {
    // if (this.type !== 'rgb') return this;

    const primes = this.comps.map((comp) => comp / 255);
    const [redPrime, greenPrime, bluePrime] = primes;
    const cMax = Math.max(...primes);
    const cMin = Math.min(...primes);
    const delta = cMax - cMin;

    let hue;

    // Hue
    if (delta === 0) hue = 0;
    else {
      let computed = 0;
      switch (cMax) {
        case redPrime:
          computed = ((greenPrime - bluePrime) / delta) % 6;
          break;

        case greenPrime:
          computed = (bluePrime - redPrime) / delta + 2;
          break;

        case bluePrime:
          computed = (redPrime - greenPrime) / delta + 4;
          break;
      }

      hue = 60 * computed;
    }

    // Saturation
    const sat = cMax ? delta / cMax : 0;

    const val = cMax;

    const _hue = hue < 0 ? 360 + hue : hue > 360 ? hue - 360 : hue;

    return new Color({ comps: [_hue, sat, val], type: 'hsv' });
  }

  /**
   * Convert color object to RGB space
   *
   * @returns Color object in RGB
   */
  HSVtoRGB(): Color {
    // if (this.type !== 'hsv') return this;

    const hue = this.comps[0];
    let [sat, val] = this.comps.slice(1);

    sat = sat > 1 ? 1 : sat;
    val = val > 1 ? 1 : val;

    // Throw
    // if (hue < 0 || hue >= 360)
    // if (sat < 0 || sat > 1)
    // if (val < 0 || val > 1)

    const C = val * sat;
    const X = C * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = val - C;

    let redPrime, greenPrime, bluePrime;

    if (hue >= 0 && hue < 60) [redPrime, greenPrime, bluePrime] = [C, X, 0];
    else if (hue >= 60 && hue < 120)
      [redPrime, greenPrime, bluePrime] = [X, C, 0];
    else if (hue >= 120 && hue < 180)
      [redPrime, greenPrime, bluePrime] = [0, C, X];
    else if (hue >= 180 && hue < 240)
      [redPrime, greenPrime, bluePrime] = [0, X, C];
    else if (hue >= 240 && hue < 300)
      [redPrime, greenPrime, bluePrime] = [X, 0, C];
    else [redPrime, greenPrime, bluePrime] = [C, 0, X];

    const primes = [redPrime, greenPrime, bluePrime];

    return new Color({
      type: 'rgb',
      comps: primes.map((colorPrime) => Math.round((colorPrime + m) * 255)),
    });
  }

  /**
   * Converts color object to hexadecimal string
   *
   * @returns {string} Hex string
   */
  toHex(): string {
    const rgbCol = this.type === 'rgb' ? this : this.HSVtoRGB();
    return rgbCol.comps
      .map((comp) =>
        comp.toString(16).length === 1
          ? `0${comp.toString(16)}`
          : comp.toString(16)
      )
      .join('');
  }
}
