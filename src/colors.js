
/**
 * Convert any color string to an [r,g,b,a] array.
 * @author Arjan Haverkamp (arjan-at-avoid-dot-org)
 * @param {string} color Any color. F.e.: 'red', '#f0f', '#ff00ff', 'rgb(x,y,x)', 'rgba(r,g,b,a)', 'hsl(180, 50%, 50%)'
 * @returns {array} [r,g,b,a] array. Caution: returns [0,0,0,0] for invalid color.
 */
function colorAsRGBA(color) {
  const div = document.createElement('div');
  div.style.backgroundColor = color;
  document.body.appendChild(div);
  let rgba = getComputedStyle(div).getPropertyValue('background-color');
  div.remove();

  if (rgba.indexOf('rgba') === -1) {
    rgba += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
  }

  return rgba.match(/[\.\d]+/g).map(a => {
    return +a
  });
}

/**
 * Convert an RGB color to CMYK
 * @param {number[]} rgb An array of 3 numbers representing the RGB color
 * @returns An array of 4 numbers representing the CMYK color
 */
function rgbToCmyk(rgb) {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const k = Math.min(1 - r, 1 - g, 1 - b);
  if (k === 1) {
    return [0, 0, 0, 1]; // Black
  }
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return [c, m, y, k];
}

/**
 * Convert a CMYK color to RGB
 * @param {number[]} cmyk An array of 4 numbers representing the CMYK color
 * @returns An array of 3 numbers representing the RGB color
 */
function cmykToRgb(cmyk) {
  const c = cmyk[0];
  const m = cmyk[1];
  const y = cmyk[2];
  const k = cmyk[3];

  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));

  return [r, g, b];
}

/**
 * Mix a given vector of colors with a given vector of weights
 * @param {string[]} colors The colors to mix
 * @param {number[]} weights The weights for each color, same length as colors
 * @returns A string representing the mixed color in rgba format
 */
function mixColors(colors, weights) {
  if (colors.length < weights.length) {
    throw new Error("Not enough colors for the weights");
  }

  const normalized_weights = normalizeVectorSum(weights);

  const mixedColor = normalized_weights.reduce((acc, weight, index) => {
    const cmyk = rgbToCmyk(colorAsRGBA(colors[index]));
    return acc.map((value, i) => value + cmyk[i] * weight);
  }, [0, 0, 0, 0]);


  // Normalize the mixed color to ensure it is a valid CMYK color
  const max = Math.max(...mixedColor);
  if (max > 1) {
    mixedColor.forEach((value, i) => { mixedColor[i] = value / max; });
  }

  const rgb = cmykToRgb(mixedColor);
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

const colorPalette = [
  "Crimson",
  "DodgerBlue",
  "LightSlateGray",
  "MediumSeaGreen",
  "DarkOrchid",
  "DarkCyan",
  "DarkOrange",
  "LightSkyBlue",
  "SteelBlue",
  "Gold",
  "LawnGreen",
  "Tomato",
  "DeepPink",
  "RoyalBlue",
  "MediumPurple",
  "SandyBrown",
  "Coral",
  "Turquoise",
  "Orchid",
  "SlateBlue",
];
