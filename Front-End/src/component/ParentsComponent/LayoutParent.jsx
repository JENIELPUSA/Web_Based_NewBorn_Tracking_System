import Table from "../ParentsComponent/ParentComponent";

function ParentLayout() {
  return (
    <div className="flex flex-col gap-6 p-2 bg-gray-100 dark:bg-gray-900 min-h-screen"> {/* Idinagdag ito */}
      {/* Table Section */}
      <div className="w-full">
        <Table />
      </div>
    </div>
  );
}

export default ParentLayout;