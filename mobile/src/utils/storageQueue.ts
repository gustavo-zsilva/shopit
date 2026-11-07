let chain = Promise.resolve();

export function enqueueStorage(task: () => Promise<void>) {
  const run = chain.then(task);
  chain = run.then(() => undefined, () => undefined);
  return run;
}
