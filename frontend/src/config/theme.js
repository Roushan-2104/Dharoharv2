// Colours for drawing surfaces that cannot read CSS variables (three.js materials, Leaflet paths).
// They are the sRGB conversions of the tokens in src/index.css: keep the two in step.
export const THEME = {
  paper: '#f8f7f3',  // --color-paper / --color-field-ink, oklch(97.5% 0.005 90)
  ink: '#0f141e',    // --color-ink, oklch(19% 0.022 266)
  mark: '#d9241b',   // --color-mark, oklch(57% 0.215 29)
  field: '#1f40be',  // --color-field, oklch(44% 0.2 266)
  oceanGlint: '#3d4a5c', // specular tint where the water mask lets the sun catch the sea
};
