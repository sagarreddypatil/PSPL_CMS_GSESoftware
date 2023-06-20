import { TimeConductorContext } from "../contexts/time-conductor";
import { ImPause2, ImPlay3 } from "react-icons/im";
import Select from "../controls/select";
import { useContext } from "react";
import { Dropdown, DropdownItem } from "../controls/dropdown";

function MovingConductorView() {
  const timeConductor = useContext(TimeConductorContext);

  const time_options = {
    "10s": 10,
    "30s": 30,
    "1m": 60,
    "5m": 300,
    "10m": 600,
    "30m": 1800,
    "1h": 3600,
    "2h": 7200,
  };
  const selectedLabel = Object.entries(time_options).find(
    ([label, value]) => value === timeConductor.moving.timespan / 1000
  )?.[0];

  const setValue = (value: number) => {
    timeConductor.setMoving({ timespan: value * 1000 });
  };

  return (
    <Dropdown name={selectedLabel}>
      {Object.entries(time_options).map(([label, value]) => {
        return (
          <DropdownItem
            key={label}
            active={selectedLabel === label}
            onClick={() => setValue(value)}
          >
            {label}
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
}

function FixedConductorView() {
  const timeConductor = useContext(TimeConductorContext);

  return (
    <label>
      {timeConductor.fixed.start.getTime()} to{" "}
      {timeConductor.fixed.end.getTime()}
    </label>
  );
}

export default function TimeConductorView() {
  const timeConductor = useContext(TimeConductorContext);

  return (
    <div className="flex items-center">
      <Select
        checked={timeConductor.paused}
        onChange={(value) => timeConductor.setPaused(value)}
      >
        <span className="text-black">
          {timeConductor.paused ? <ImPause2 /> : <ImPlay3 />}
        </span>
      </Select>
      <div className="m-1"></div>
      {timeConductor.paused ? <FixedConductorView /> : <MovingConductorView />}
    </div>
  );
}
