import React, { useState } from "react";

const NewbornForm = ({ onSave, onAddNewborn, theme }) => {
    // Accept theme prop
    const [newbornName, setName] = useState("");
    const [dateOfBirth, setBirthDate] = useState("");
    const [gender, setGender] = useState("");
    const [motherName, setParentName] = useState("");
    const [FullAddress, setAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newbornName || !dateOfBirth || !gender || !motherName || !FullAddress) {
            // You might want to add a more visible error message here for the user
            return;
        }

        setIsLoading(true);
        try {
            onAddNewborn({
                newbornName,
                dateOfBirth,
                gender,
                motherName,
                FullAddress,
                createdAt: new Date().toISOString(),
            });
            setName("");
            setBirthDate("");
            setGender("");
            setParentName("");
            setAddress("");
            onSave();
        } catch (e) {
            console.error("Error adding newborn:", e);
            // Optionally show an error message to the user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`mb-8 rounded-lg p-6 shadow-inner transition-colors duration-300 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} `}>
            <h3 className={`mb-4 text-2xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-700"}`}>Add Newborn</h3>
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
                <div>
                    <label
                        htmlFor="name"
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={newbornName}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Clint ALDOUS Amistoso Jr"
                        className={`mt-1 block w-full rounded-md border p-2 shadow-sm transition-colors duration-300 focus:border-blue-500 focus:ring-blue-500 ${theme === "dark" ? "border-gray-600 bg-gray-800 text-gray-100" : "border-gray-300 bg-white text-gray-800"} `}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="birthDate"
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        id="birthDate"
                        value={dateOfBirth}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className={`mt-1 block w-full rounded-md border p-2 shadow-sm transition-colors duration-300 focus:border-blue-500 focus:ring-blue-500 ${theme === "dark" ? "border-gray-600 bg-gray-800 text-gray-100" : "border-gray-300 bg-white text-gray-800"} `}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="parentName"
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                        Mother's Name
                    </label>
                    <input
                        type="text"
                        id="parentName"
                        value={motherName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="e.g. Maria Santos"
                        className={`mt-1 block w-full rounded-md border p-2 shadow-sm transition-colors duration-300 focus:border-blue-500 focus:ring-blue-500 ${theme === "dark" ? "border-gray-600 bg-gray-800 text-gray-100" : "border-gray-300 bg-white text-gray-800"} `}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="address"
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                        Full Address
                    </label>
                    <input
                        type="text"
                        id="address"
                        value={FullAddress}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. ZONE 9 123 Mabini St Manila or 123 Mabini St Manila "
                        className={`mt-1 block w-full rounded-md border p-2 shadow-sm transition-colors duration-300 focus:border-blue-500 focus:ring-blue-500 ${theme === "dark" ? "border-gray-600 bg-gray-800 text-gray-100" : "border-gray-300 bg-white text-gray-800"} `}
                        required
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label
                        htmlFor="gender"
                        className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                        Gender
                    </label>
                    <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={`mt-1 block w-full rounded-md border p-2 shadow-sm transition-colors duration-300 focus:border-blue-500 focus:ring-blue-500 ${theme === "dark" ? "border-gray-600 bg-gray-800 text-gray-100" : "border-gray-300 bg-white text-gray-800"} `}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="col-span-1 flex justify-end md:col-span-2">
                    <button
                        type="submit"
                        className={`transform rounded-lg bg-red-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-pink-600 ${isLoading ? "cursor-not-allowed opacity-75" : "hover:scale-105"}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Newborn"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewbornForm;
