export function formatTwoDigits(digit: number) {
  return digit.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

export function frontierItems<T>(items: T[], f: (t: T) => boolean): T[] {
  const front = items.filter(f);
  const after = items.filter((item) => !f(item));
  return [...front, ...after];
}
