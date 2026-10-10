/** A response deadline does not cancel I/O: retain the probe until actual settlement. */
export class SharedProbe<T> {
  private current: Promise<T> | null = null;
  run(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    if (this.current) return this.current;
    const work = Promise.resolve().then(operation);
    let timer: ReturnType<typeof setTimeout>;
    const response = Promise.race([work, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Probe timeout')), timeoutMs);
    })]);
    this.current = response;
    const release = () => {
      clearTimeout(timer);
      if (this.current === response) this.current = null;
    };
    void work.then(release, release);
    return response;
  }
}
