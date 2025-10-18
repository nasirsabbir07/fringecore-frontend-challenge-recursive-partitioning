export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 65;
  const l = 65;
  return `hsl(${h} ${s}% ${l}%)`;
}
