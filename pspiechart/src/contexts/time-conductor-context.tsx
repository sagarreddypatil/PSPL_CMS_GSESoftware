import { createContext, useEffect, useState } from "react";

/*
Context to store the fixed timespawn, moving timespan, and if data has been paused or not. Contexts allow for all children components
of the component which provides the context to access the variables globally produced by the context. In the App.tsx component, 
all components have access to this context as the App component is the provider and wraps all components.

ALL COMPONENTS HAVE ACESS TO THIS CONTEXT
*/

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

  // check if "moving" is stored in local storage and stores in variable. Defaults to null.
  const movingLocal = JSON.parse(
    localStorage.getItem("moving") ?? "null"
  ) as IMovingTimespan | null;

  // state to keep track if operation is paused or not
  const [paused, setPaused] = useState(false);

  // creating state for the fixed timespan. The fixed timespan ranges from (pate date - 5 minutes, present date)
  const [fixed, setFixed] = useState<IFixedTimespan>({
    start: new Date(date.getTime() - defaultTimespan),
    end: date,
  });

  // state to keep track how long the vehicle has been moving (?). defaults to 5 minutes
  const [moving, setMoving] = useState<IMovingTimespan>(
    movingLocal ?? {
      timespan: defaultTimespan,
    }
  );

  useEffect(() => {
    // save moving state to local storage whenever paused or moving state variables are modified
    localStorage.setItem("moving", JSON.stringify(moving));
  }, [paused, moving]);

  // modifies the pause state variable. Also modifies the fixed time span state varible by changing the start
  // of the time span to be the current date subtracted by the timespan of the movement of the vehicle. Also resets end of the timespan
  // to the current date.
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

  // Allows for all children elements to access the fixed time span, moving time span, and if the vehicle data has been paused or not
  // Also allows for children to modify state variables via the function calls.
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
