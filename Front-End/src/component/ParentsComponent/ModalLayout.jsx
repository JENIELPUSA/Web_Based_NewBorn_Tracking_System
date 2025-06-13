import React, { useContext } from 'react';
import Schedule from './Schedule';
import VaccineRecordTable from "../ParentsComponent/VaccineRecordTable";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function VaccineScheduleDisplay({ passData }) {
    const { vaccineRecord } = useContext(VaccineRecordDisplayContext);
    
    const filteredData = vaccineRecord.filter((item) => {
        const fullName = `${passData.firstName || ''} ${passData.lastName || ''}`.toUpperCase();
        const itemFullName = `${item.newbornName || ''}`.toUpperCase();

        const matchedName = itemFullName === fullName;
        const matchedZone = (item.newbornZone || '').toUpperCase() === (passData.zone || '').toUpperCase();
        const matchedMother = (item.motherName || '').toUpperCase() === (passData.mothersName || '').toUpperCase();
        const matchedGender = item.gender === passData.gender;
        const matchedAddress = (item.FullAddress || '').toUpperCase().includes((passData.address || '').toUpperCase());
        const matchedDOB = item.dateOfBirth === passData.dateOfBirth;
        const matchextensionName = item.extensionName === passData.extensionName;

        return matchedName &&
            matchedZone &&
            matchedMother &&
            matchedGender &&
            matchedAddress &&
            matchextensionName &&
            matchedDOB;
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8"> 
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Vaccine Schedule and Records
            </h1>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-6 w-full md:w-1/2">
                    <VaccineRecordTable dataToDisplay={filteredData} />
                </div>

                <div className="w-full md:w-1/2">
                    <Schedule scheduleData={filteredData} />
                </div>
            </div>
        </div>
    );
}

export default VaccineScheduleDisplay;
