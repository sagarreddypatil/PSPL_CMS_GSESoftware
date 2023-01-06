export type TimeDataPoint = {
  time: number;
  value: number;
};

export type FrequencyDataPoint = {
  frequency: number[];
  value: number[];
};

export interface TimeDataSource {
  subscribe(callback: (data: TimeDataPoint[]) => void): void;
  get(a: number, b: number): TimeDataPoint[];
}

export interface FrequencyDataSource {
  subscribe(callback: (data: FrequencyDataPoint[]) => void): void;
}
