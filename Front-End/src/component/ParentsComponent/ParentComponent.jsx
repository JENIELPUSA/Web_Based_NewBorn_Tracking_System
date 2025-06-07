import React, { useState } from "react";
import ModalLayout from "./ModalLayout"; // Assuming ModalLayout exists and is correctly imported

function ParentComponent() {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    extName: "", // For Jr., Sr. etc.
    middleName: "",
    dateOfBirth: "",
    gender: "", // Using this for the dropdown
    mothersName: "", // Now a text input
    zone: "", // New field for zone dropdown
    address: "", // New field for address textbox
  });

  const [isPassFormOpen, setPassFormOpen] = useState(false);

  const [dropdownOpenGender, setDropdownOpenGender] = useState(false);
  const [dropdownOpenZone, setDropdownOpenZone] = useState(false); // New state for Zone dropdown
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedZone, setSelectedZone] = useState(""); // New state for selected Zone
  const [isData, setData] = useState(""); // Dummy data for zones (ideally fetched from an API)
  const zones = ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6", "Zone 7", "Zone 8", "Zone 9", "Zone 10"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Conditional trimming: trim whitespace for all fields except 'mothersName' and 'address'
    const newValue = name === "mothersName" || name === "address" ? value : value.trim();
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleSelectGender = (gender) => {
    setSelectedGender(gender);
    setFormData((prevData) => ({ ...prevData, gender: gender }));
    setDropdownOpenGender(false);
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    setFormData((prevData) => ({ ...prevData, zone: zone }));
    setDropdownOpenZone(false);
  };

  const handleCloseModal = () => {
    setPassFormOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Here you would typically send formData to your backend
    console.log("Form Submitted:", formData);
    setData(formData);
    setPassFormOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="relative flex w-full max-w-4xl flex-col rounded-xl bg-white px-6 py-10 shadow-lg dark:bg-gray-800">
        {/* Header Section */}
        <div className="mb-8 text-center">
          {/* Placeholder for a logo, if any */}
          <div className="mb-4">
            {/* You can replace this with an actual image if you have one */}
            {/* <img src="/path/to/your/logo.png" alt="Newborn Tracking Logo" className="mx-auto h-16" /> */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-xl font-bold text-white">
              NT
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-red-700 dark:text-red-400">NEWBORN TRACKING SYSTEM</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Safeguarding Every New Life</p>
        </div>

        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white xs:text-lg sm:text-3xl">Newborn's Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BABY'S DETAILS SECTION */}
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Baby's Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="col-span-1">
                <label htmlFor="lastName" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="e.g. Dela Cruz"
                  autoComplete="off"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="firstName" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="e.g. Juan Antonio"
                  autoComplete="off"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="extName" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ext. Name <span className="text-xs font-normal text-gray-500 dark:text-gray-400">*if any</span>
                </label>
                <input
                  type="text"
                  id="extName"
                  name="extName"
                  placeholder="e.g. Jr."
                  autoComplete="off"
                  value={formData.extName}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="middleName" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Middle Name
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">** Leave blank if none</span>
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  placeholder="e.g. San Juan"
                  autoComplete="off"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="col-span-1">
                <label htmlFor="dateOfBirth" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Gender Dropdown */}
              <div className="relative col-span-1">
                <label htmlFor="gender" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Gender
                </label>
                <div
                  className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  onClick={() => setDropdownOpenGender(!dropdownOpenGender)}
                >
                  <span>{selectedGender || "Select Gender"}</span>
                  <i className={`fas ${dropdownOpenGender ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`}></i>
                </div>
                {dropdownOpenGender && (
                  <ul
                    className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:shadow-xl"
                    style={{ zIndex: 100 }}
                  >
                    <li
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSelectGender("")}
                    >
                      Select Gender
                    </li>
                    <li
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSelectGender("Male")}
                    >
                      Male
                    </li>
                    <li
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSelectGender("Female")}
                    >
                      Female
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* PARENTAL & BIRTH INFORMATION SECTION */}
          <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Parental & Birth Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4"> {/* Changed to md:grid-cols-4 for consistency */}
              {/* Mother's Name */}
              <div className="col-span-1">
                <label htmlFor="mothersName" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Mother's Name
                </label>
                <input
                  type="text"
                  id="mothersName"
                  name="mothersName"
                  placeholder="e.g. Maria Clara"
                  autoComplete="off"
                  value={formData.mothersName}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Zone Dropdown */}
              <div className="relative col-span-1">
                <label htmlFor="zone" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Zone
                </label>
                <div
                  className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  onClick={() => setDropdownOpenZone(!dropdownOpenZone)}
                >
                  <span>{selectedZone || "Select Zone"}</span>
                  <i className={`fas ${dropdownOpenZone ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`}></i>
                </div>
                {dropdownOpenZone && (
                  <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                    <li
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => handleSelectZone("")}
                    >
                      Select Zone
                    </li>
                    {zones.map((zoneOption, index) => (
                      <li
                        key={index}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={() => handleSelectZone(zoneOption)}
                      >
                        {zoneOption}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Address Textbox */}
              <div className="col-span-2"> {/* Changed to col-span-2 to occupy the remaining two columns */}
                <label htmlFor="address" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="e.g. KAWAYAN BILIRAN"
                  autoComplete="off"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="dark:red-blue-700 w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700 dark:hover:bg-pink-600"
          >
            Submit Newborn Details
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">&copy; NEWBORN TRACKING SYSTEM 2025 | All rights reserved</p>
      </div>

      <ModalLayout
        isOpen={isPassFormOpen}
        onClose={handleCloseModal}
        passData={isData}
      />
    </div>
  );
}

export default ParentComponent;