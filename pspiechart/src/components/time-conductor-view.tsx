import { TimeConductorContext } from "../contexts/time-conductor";
import { ImPause2, ImPlay3 } from "react-icons/im";
import Select from "../controls/select";
import { useContext } from "react";

export default function TimeConductorView() {
  const timeConductor = useContext(TimeConductorContext);

  return (
    <>
      <Select
        checked={timeConductor.paused}
        onClick={() => timeConductor.setPaused(!timeConductor.paused)}
      >
        <span className="text-black">
          {timeConductor.paused ? <ImPause2 /> : <ImPlay3 />}
        </span>
      </Select>
    </>
  );
}
