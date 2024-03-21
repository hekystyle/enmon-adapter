export type AlsValues = Partial<{
  jobId: string;
}>;

export class Host<T> {
  constructor(public readonly ref: T) {}
}
