
import ParentTable from "../ParentsComponent/ParentTable";

function ParentLayoutTable() {
  return (
    <div className="flex flex-col gap-6 p-6"> {/* Changed from flex-row to flex-col */}

      {/* Table Section */}
      <div className="w-full">
        <ParentTable />
      </div>
    </div>
  );
}

export default ParentLayoutTable;
