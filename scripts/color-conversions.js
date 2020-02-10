export const hexToRgb = (hex, returnArray = false) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result == null) {
    return null;
  }

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return returnArray ? [r, g, b] : { r, g, b };
};

export const rgbToHsl = rgbArr => {
  const r1 = rgbArr[0] / 255;
  const g1 = rgbArr[1] / 255;
  const b1 = rgbArr[2] / 255;

  const maxColor = Math.max(r1, g1, b1);
  const minColor = Math.min(r1, g1, b1);

  // Calculate L:
  let L = (maxColor + minColor) / 2;
  let S = 0;
  let H = 0;

  if (maxColor !== minColor) {
    // Calculate S:
    if (L < 0.5) {
      S = (maxColor - minColor) / (maxColor + minColor);
    } else {
      S = (maxColor - minColor) / (2.0 - maxColor - minColor);
    }

    // Calculate H:
    if (r1 === maxColor) {
      H = (g1 - b1) / (maxColor - minColor);
    } else if (g1 == maxColor) {
      H = 2.0 + (b1 - r1) / (maxColor - minColor);
    } else {
      H = 4.0 + (r1 - g1) / (maxColor - minColor);
    }
  }

  L *= 100;
  S *= 100;
  H *= 60;

  if (H < 0) {
    H += 360;
  }

  return { h: H, s: S, l: L };
};

export const luminance = (r, g, b) => {
  const a = [r, g, b].map(value => {
    const v = value / 255;

    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const contrast = (rgb1, rgb2) =>
  (luminance(rgb1[0], rgb1[1], rgb1[2]) + 0.05) /
  (luminance(rgb2[0], rgb2[1], rgb2[2]) + 0.05);

const checksRGB = color => {
  if (color <= 0.03928) {
    return color / 12.92;
  }

  return Math.pow((color + 0.055) / 1.055, 2.4);
};

/* Function that returns a color object */
const getColorObject = color => {
  const colorObj = {
    r: checksRGB(color.r / 255),
    g: checksRGB(color.g / 255),
    b: checksRGB(color.b / 255)
  };
  return colorObj;
};

/* Function that calculates the ratio between two colors */
export const calculateRatio = (color1, color2) => {
  const colorOneObject = getColorObject(color1);
  const colorTwoObject = getColorObject(color2);
  const colorOneL =
    0.2126 * colorOneObject.r +
    0.7152 * colorOneObject.g +
    0.0722 * colorOneObject.b;
  const colorTwoL =
    0.2126 * colorTwoObject.r +
    0.7152 * colorTwoObject.g +
    0.0722 * colorTwoObject.b;
  if (colorOneL > colorTwoL) {
    return (colorOneL + 0.05) / (colorTwoL + 0.05);
  } else {
    return (colorTwoL + 0.05) / (colorOneL + 0.05);
  }
};

if (typeof window !== 'undefined') {
  window.contrast = contrast;
  window.calculateRatio = calculateRatio;
}
