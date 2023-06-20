import { createContext, useState } from "react";

interface IFixedTimespan {
  start: Date;
  end: Date;
}

interface IMovingTimespan {
  timespan: number; // milliseconds
}

interface ITimeConductorContext {
  paused: boolean;
  fixed: IFixedTimespan;
  moving: IMovingTimespan;

  setPaused: (paused: boolean) => void;
  setFixed: (fixed: IFixedTimespan) => void;
  setMoving: (moving: IMovingTimespan) => void;
}

export const TimeConductorContext = createContext<ITimeConductorContext>({
  paused: false,
  fixed: { start: new Date(0), end: new Date(0) },
  moving: { timespan: 0 },
  setPaused: () => {},
  setFixed: () => {},
  setMoving: () => {},
});

export default function TimeConductorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultTimespan = 60 * 1000; // 5 minutes
  const date = new Date();

  const [paused, setPaused] = useState(false);
  const [fixed, setFixed] = useState<IFixedTimespan>({
    start: new Date(date.getTime() - defaultTimespan),
    end: date,
  });
  const [moving, setMoving] = useState<IMovingTimespan>({
    timespan: defaultTimespan,
  });

  return (
    <TimeConductorContext.Provider
      value={{
        paused,
        fixed,
        moving,
        setPaused,
        setFixed,
        setMoving,
      }}
    >
      {children}
    </TimeConductorContext.Provider>
  );
}
