
import Calendar from "./VaccinationCalendar";

function Layout() {
  return (
    <div className="flex flex-col gap-6 p-6"> {/* Changed from flex-row to flex-col */}

    
        <Calendar />
 
    </div>
  );
}

export default Layout;
