export type AlsValues = Partial<{
  jobId: string;
  configId: string;
}>;

export class Host<T> {
  constructor(public readonly ref: T) {}
}
