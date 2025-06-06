
import Table from "../Profilling/ProfillingTable";

function Layout() {
  return (
    <div className="flex flex-col gap-6 p-6"> {/* Changed from flex-row to flex-col */}

      {/* Table Section */}
      <div className="w-full">
        <Table />
      </div>
    </div>
  );
}

export default Layout;
