import { TimeConductorContext } from "../contexts/time-conductor-context";
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
    "4h": 14400,
    "8h": 28800,
    "12h": 43200,
    "1d": 86400,
    "2d": 172800,
  };
  const selectedLabel = Object.entries(time_options).find(
    ([, value]) => value === timeConductor.moving.timespan / 1000
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

function DateTimeTextbox(props: {
  value?: Date;
  onChange?: (time: Date) => void;
}) {
  const { value, onChange } = props;

  return (
    <input
      type="datetime-local"
      className="rounded-none border border-rush dark:bg-night-sky"
      defaultValue={value?.toISOString().slice(0, 19)}
      onChange={(e) => {
        const time = new Date(e.target.value + "Z");
        onChange?.(time);
      }}
    />
  );
}

function FixedConductorView() {
  const timeConductor = useContext(TimeConductorContext);
  const fixed = timeConductor.fixed;
  const setStart = (time: Date) => {
    timeConductor.setFixed({ start: time, end: fixed.end });
  };
  const setEnd = (time: Date) => {
    timeConductor.setFixed({ start: fixed.start, end: time });
  };

  return (
    <>
      <DateTimeTextbox value={fixed.start} onChange={setStart} />
      <label className="mx-2">to</label>
      <DateTimeTextbox value={fixed.end} onChange={setEnd} />
    </>
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
        <span>{timeConductor.paused ? <ImPause2 /> : <ImPlay3 />}</span>
      </Select>
      <div className="m-1"></div>
      {timeConductor.paused ? <FixedConductorView /> : <MovingConductorView />}
    </div>
  );
}
