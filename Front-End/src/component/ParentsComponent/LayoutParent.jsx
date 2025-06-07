import Table from "../ParentsComponent/ParentComponent";

function ParentLayout() {
  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-900 xs:py-0 lg:py-8"> {/* Added py-8 for vertical padding */}
      {/* Table Section */}
      <div className="w-full flex-grow"> {/* Removed mt-6 from here */}
        <Table />
      </div>
    </div>
  );
}
export default ParentLayout;