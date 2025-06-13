import Table from "../ParentsComponent/ParentComponent";

function ParentLayout() {
  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-900
                    p-2 // Default small padding for all screens
                    xs:p-4 // A bit more padding on 'xs' (360px) and up
                    sm:p-6 // Even more padding on 'sm' (640px) and up (if you still use 'sm' in your overall layout)
                    lg:py-8 lg:px-8 // Larger vertical and horizontal padding for larger screens
                    ">
      {/* Table Section */}
      <div className="w-full flex-grow">
        <Table />
      </div>
    </div>
  );
}
export default ParentLayout;