/** Per-process admission limit. A permit is released only when its resource has stopped. */
export class Capacity {
  private active = 0;
  private readonly maximum: number;
  constructor(maximum: number) {
    if (!Number.isInteger(maximum) || maximum < 1) throw new RangeError('invalid capacity');
    this.maximum = maximum;
  }
  acquire(): (() => void) | null {
    if (this.active >= this.maximum) return null;
    this.active++;
    let released = false;
    return () => { if (!released) { released = true; this.active--; } };
  }
}
