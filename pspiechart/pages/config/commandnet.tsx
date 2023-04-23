import Navbar, { NavTitle } from "@/components/Navbar";

export default function CommandNet() {
  return (
    <div className="bg-dark p-2 w-100 h-100 d-flex flex-column">
      <Navbar>
        <NavTitle>
          <h3 className="mb-0 px-2">CommandNet Interface</h3>
        </NavTitle>
      </Navbar>
      <div className="bg-black p-4 w-100">
        <h3>Commands</h3>
      </div>
      <div className="bg-black p-4 mt-2 w-100">
        <h3>Variables</h3>
      </div>
    </div>
  );
}
