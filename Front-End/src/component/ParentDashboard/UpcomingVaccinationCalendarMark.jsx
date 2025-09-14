import React from 'react';

const UpcomingVaccinationsCalendarMark = ({ doses }) => {
  const upcoming = doses.filter(d => d.nextDueDate && new Date(d.nextDueDate) > new Date());

  const groupedByMonth = upcoming.reduce((acc, dose) => {
    const date = new Date(dose.nextDueDate);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'long' });

    acc[year] = acc[year] || {};
    acc[year][month] = acc[year][month] || [];
    acc[year][month].push(dose);

    return acc;
  }, {});

  return (
    <>
      <h4 className="text-2xl font-bold mb-4 text-blue-600">
        Upcoming Vaccinations
      </h4>
      {upcoming.length > 0 ? (
        <div className="p-4 rounded-lg shadow-sm border bg-white border-blue-100">
          {Object.keys(groupedByMonth).sort().map(year => (
            <div key={year} className="mb-6">
              <h5 className="text-xl font-bold mb-3 border-b pb-2 text-blue-800 border-blue-200">
                {year}
              </h5>
              {Object.keys(groupedByMonth[year]).sort((a, b) => {
                const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                return monthOrder.indexOf(a) - monthOrder.indexOf(b);
              }).map(month => (
                <div key={month} className="mb-4 pl-4 border-l-4 border-blue-200">
                  <h6 className="text-lg font-semibold mb-2 text-blue-700">
                    {month}
                  </h6>
                  <ul className="list-none text-gray-800">
                    {groupedByMonth[year][month]
                      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
                      .map((dose, i) => (
                        <li key={i} className="mb-1 flex items-center">
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">
                            {new Date(dose.nextDueDate).getDate()}
                          </span>
                          <span>
                            <span className="font-semibold">{dose.vaccineName}</span>
                            {dose.administeredBy && (
                              <span className="text-gray-500 text-sm ml-2">
                                (Administered By: {dose.administeredBy})
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No upcoming vaccinations currently scheduled.</p>
      )}
    </>
  );
};

export default UpcomingVaccinationsCalendarMark;