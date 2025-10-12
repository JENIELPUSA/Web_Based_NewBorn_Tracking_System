import React from "react";
import VaccineStockGraph from "./VaccineStockGraph";
import LogActionsAudit from "./graphandlogaction";

function GraphAndLogContainer() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-7">
      <div className="col-span-1 md:col-span-2 lg:col-span-4">
        <VaccineStockGraph />
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <LogActionsAudit />
      </div>
    </div>
  );
}

export default GraphAndLogContainer;
