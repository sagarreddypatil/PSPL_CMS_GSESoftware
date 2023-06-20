import { createContext, useEffect, useState } from "react";

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

  const pausedLocal = JSON.parse(localStorage.getItem("paused") ?? "null") as
    | boolean
    | null;
  const movingLocal = JSON.parse(
    localStorage.getItem("moving") ?? "null"
  ) as IMovingTimespan | null;

  const [paused, setPaused] = useState(pausedLocal ?? false);
  const [fixed, setFixed] = useState<IFixedTimespan>({
    start: new Date(date.getTime() - defaultTimespan),
    end: date,
  });
  const [moving, setMoving] = useState<IMovingTimespan>(
    movingLocal ?? {
      timespan: defaultTimespan,
    }
  );

  useEffect(() => {
    // save paused and moving to local storage
    localStorage.setItem("paused", JSON.stringify(paused));
    localStorage.setItem("moving", JSON.stringify(moving));
  }, [paused, moving]);

  const actualSetPaused = (newPaused: boolean) => {
    setPaused(newPaused);
    if (newPaused) {
      const date = new Date();
      setFixed({
        start: new Date(date.getTime() - moving.timespan),
        end: date,
      });
    }
  };

  return (
    <TimeConductorContext.Provider
      value={{
        paused,
        fixed,
        moving,
        setPaused: actualSetPaused.bind(null),
        setFixed,
        setMoving,
      }}
    >
      {children}
    </TimeConductorContext.Provider>
  );
}
