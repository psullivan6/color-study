import fs from 'fs';
import path from 'path';
import _sortBy from 'lodash/sortBy';
import _uniq from 'lodash/uniq';
import _flatten from 'lodash/flatten';
import { meetsContrastGuidelines } from 'polished';

import { permutations } from './permutations';
import {
  hexToRgb,
  rgbToHsl,
  luminance,
  contrast,
  calculateRatio
} from './color-conversions';

const hexStrings = ['00', '33', '66', '99', 'CC', 'FF'];
const fullList = hexStrings.concat(hexStrings).concat(hexStrings);
const uniqueList = _uniq(
  permutations(fullList, 3).map(item => `#${item.join('')}`)
);

const all = uniqueList.map(item => {
  const { r, g, b } = hexToRgb(item);
  const { h, s, l } = rgbToHsl([r, g, b]);
  const blackContrast = contrast([r, g, b], [0, 0, 0]);
  const whiteContrast = contrast([255, 255, 255], [r, g, b]);

  return {
    r,
    g,
    b,
    hex: item,
    h,
    s,
    l,
    luminance: luminance(r, g, b),
    contrast: {
      black: blackContrast,
      white: whiteContrast,
      max: blackContrast > whiteContrast ? blackContrast : whiteContrast,
      text: blackContrast > whiteContrast ? 'black' : 'white'
    }
  };
});

const allHexes = all.map(colorObj => colorObj.hex);

const colorStyles = allHexes
  .map(color => {
    const hexless = color.substring(1);
    return `.bg-${hexless}{background-color:${color};} .color-${hexless}{color:${color};}\n`;
  })
  .join('');

const everyCombo = all
  .map(baseColor =>
    all.map(accentColor => ({
      baseColor: baseColor.hex,
      accentColor: accentColor.hex,
      contrast: baseColor.contrast,
      contrastGuidelines: meetsContrastGuidelines(
        baseColor.hex,
        accentColor.hex
      )
    }))
  )
  .map(paletteCombos =>
    paletteCombos.filter(palette => {
      return Object.values(palette.contrastGuidelines).some(
        passesContrast => passesContrast
      );
    })
  );

const sorted = _sortBy(all, ['h', 'luminance', 's']);

const minimumContrast = 10;
const colorCombinations = _flatten(
  all
    .map(baseColor =>
      all
        .filter(
          accentColor =>
            calculateRatio(
              { r: baseColor.r, g: baseColor.g, b: baseColor.b },
              { r: accentColor.r, g: accentColor.g, b: accentColor.b }
            ) > minimumContrast
        )
        .map(accentColor => ({
          baseColor,
          accentColor,
          contrast: calculateRatio(
            { r: baseColor.r, g: baseColor.g, b: baseColor.b },
            { r: accentColor.r, g: accentColor.g, b: accentColor.b }
          )
        }))
    )
    .filter(colorCombos => colorCombos.length > 0)
).map(colorCombo => ({
  accentColor: colorCombo.accentColor.hex,
  baseColor: colorCombo.baseColor.hex,
  contrast: colorCombo.contrast
}));

const contrastCounts = {};

colorCombinations.forEach(combo => {
  const key = Math.floor(combo.contrast);

  if (typeof contrastCounts[key] === 'undefined') {
    contrastCounts[key] = 1;
  } else {
    contrastCounts[key] += 1;
  }
});

const generateColorsFile = () => {
  // const fileData = `
  //   export const all = ${JSON.stringify(all)};
  //   export const colorCombinations = ${JSON.stringify(colorCombinations)};
  //   export const sorted = ${JSON.stringify(sorted)};
  //   export const contrastCounts = ${JSON.stringify(contrastCounts)};
  //   export default ${JSON.stringify({ all, colorCombinations, sorted })};
  // `;

  // const fileData = `module.exports = ${JSON.stringify(colorCombinations)}`;
  const fileData = `module.exports = ${JSON.stringify(everyCombo)}`;

  fs.writeFileSync(
    path.resolve(__dirname, '..', 'src/colors.js'),
    fileData,
    'utf8'
  );

  fs.writeFileSync(
    path.resolve(__dirname, '..', 'public/colors.css'),
    colorStyles,
    'utf8'
  );

  console.log('DONE');
};

export default generateColorsFile();
