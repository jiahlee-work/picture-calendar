export async function retry<T>(work: () => Promise<T>, attempts = 2): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }

    return retry(work, attempts - 1);
  }
}
