import React, { useState, useContext } from "react";
import { PencilIcon, TrashIcon, Plus, ShieldCheck } from "lucide-react";
import UserFormModal from "../NewBorn/AddNewBorn";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
import AddNewBornForm from "../VaccineRecord/AddForm";
import StatusVerification from "../../ReusableFolder/StatusModal";
import DisplayVaccine from "../AssignVaccine/DisplayVaccine";

function NewBorn() {
    const [selectedBorn, setSelectedBorn] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isAsignFormOpen, setAssignFormOpen] = useState(false);
    const { newBorn, DeleteNewBorn } = useContext(NewBornDisplayContext);
    const [IDNewborn, setIDNewborn] = useState("");
    const [isVerification, setVerification] = useState(false);
    const [deleteId, setDeleteID] = useState("");
    const [isDisplayVaccine, setDisplayVaccine] = useState("");
    const [isNewBordId, setNewBornId] = useState("");

    const filteredUsers = newBorn.filter((user) =>
        `${user.firstName} ${user.lastName} ${user.username} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handleAddClick = () => {
        setAddFormOpen(true);
        setSelectedBorn(null);
    };

    const handleCloseModal = () => {
        setVerification(false)
        setAddFormOpen(false);
        setAssignFormOpen(false);
        setSelectedBorn(null);
        setDisplayVaccine(false);
    };

    const handleDeleteNewBorn = async (newbordID) => {
        setVerification(true);
        setDeleteID(newbordID);   
    };

    const handleConfirmDelete = async () => {
        await DeleteNewBorn(deleteId);
        setUsers((prevUsers) => {
            const updated = prevUsers.filter((user) => user._id !== deleteId);
            return updated;
        });
        handleCloseModal();
    };

    const onBornSelect = (user) => {
        setAddFormOpen(true);
        setSelectedBorn(user);
    };

    const handleAsign = (Data) => {
        setIDNewborn(Data);
        setAssignFormOpen(true);
    };

    const handleDisplayVaccine = (data) => {
        setDisplayVaccine(true);
        setNewBornId(data);
    }

    const getInitials = (name) => {
    if (!name) return "NB";
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;


};  
return (
    <div className="card">
        <div className="card-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="card-title">New Born List</p>
            <input
                type="text"
                placeholder="Search users..."
                className="input input-sm w-full rounded-md border px-3 py-1 text-sm bg-white text-gray-800 dark:bg-slate-800 dark:text-gray-200 sm:w-56"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
            />
        </div>
        <div className="block p-4 sm:hidden">
            <button
                onClick={handleAddClick}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
                <Plus className="h-5 w-5" />
                Add New Born
            </button>

            {currentUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">No records found.</div>
            ) : (
                currentUsers.map((newBorn, index) => (
                    <div key={newBorn._id} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start gap-4">
                            {newBorn.avatar ? (
                                <img
                                    src={newBorn.avatar}
                                    alt={newBorn.fullName || "Newborn"}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                                    {newBorn.fullName ? getInitials(newBorn.fullName) : "NB"}
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-800 dark:text-gray-200">{newBorn.fullName}</h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {newBorn.motherName}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        #{indexOfFirstUser + index + 1}
                                    </span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                                        <p className="text-gray-800 dark:text-gray-200">{newBorn.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">DOB</p>
                                        <p className="text-gray-800 dark:text-gray-200">{newBorn.dateOfBirth}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                                        <p className="text-gray-800 dark:text-gray-200">{newBorn.birthWeight}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
                                        <p className="text-gray-800 dark:text-gray-200">{newBorn.birthHeight}</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        onClick={() => onBornSelect(newBorn)}
                                        className="rounded bg-blue-500 p-1.5 text-white hover:bg-blue-600"
                                        title="Edit"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNewBorn(newBorn._id)}
                                        className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                        title="Delete"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleAsign(newBorn._id)}
                                        className="rounded bg-orange-500 p-1.5 text-white hover:bg-orange-600"
                                        title="Assign Vaccine"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDisplayVaccine(newBorn._id)}
                                        className="rounded bg-green-500 p-1.5 text-white hover:bg-green-600"
                                        title="Vaccine List"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
            <div className="card-body p-0">
                <div className="relative h-[500px] w-full overflow-auto">
                    <table className="table w-full text-sm">
                        <thead className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Avatar</th>
                                <th className="p-3 text-left">FullName</th>
                                <th className="p-3 text-left">Gender</th>
                                <th className="p-3 text-left">DOB</th>
                                <th className="p-3 text-left">Address</th>
                                <th className="p-3 text-left">Birth Weight</th>
                                <th className="p-3 text-left">Birth Height</th>
                                <th className="p-3 text-left">MotherName</th>
                                <th className="p-3 text-left">Contact Number</th>
                                <th className="p-3 text-left">AssignedBy</th>
                                <th className="p-3 text-left">
                                    <button
                                        onClick={handleAddClick}
                                        className="group relative rounded bg-blue-500 px-2 py-1 text-white hover:bg-red-600"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 group-hover:opacity-100">
                                            Add New Born
                                        </span>
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((newBorn, index) => (
                                    <tr
                                        key={newBorn._id}
                                        className="border-b border-gray-200 dark:border-gray-700"
                                    >
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{indexOfFirstUser + index + 1}</td>
                                        <td className="p-3 align-top">
                                            {newBorn.avatar ? (
                                                <img
                                                    src={newBorn.avatar}
                                                    alt={newBorn.fullName || "Newborn"}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                                                    {newBorn.fullName ? getInitials(newBorn.fullName) : "NB"}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.fullName}</td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.gender}</td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.dateOfBirth}</td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.address}</td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.birthWeight}</td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.birthHeight}</td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.motherName}</td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.phoneNumber}</td>
                                        <td className="p-3 align-top text-gray-800 dark:text-gray-200 capitalize">{newBorn.addedByName}</td>
                                        <td className="p-3 align-top">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onBornSelect(newBorn)}
                                                    className="group relative rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                    <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 group-hover:opacity-100">
                                                        Edit New Born
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNewBorn(newBorn._id)}
                                                    className="group relative rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 group-hover:opacity-100">
                                                        Delete New Born
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleAsign(newBorn._id)}
                                                    className="group relative rounded bg-blue-500 px-2 py-1 text-white hover:bg-orange-600"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 group-hover:opacity-100">
                                                        Assign Vaccine
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleDisplayVaccine(newBorn._id)}
                                                    className="group relative rounded bg-green-500 px-2 py-1 text-white hover:bg-green-600"
                                                >
                                                    <ShieldCheck className="h-4 w-4" />
                                                    <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 group-hover:opacity-100">
                                                        List of Vaccine
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3">
                <button
                    className="px-3 py-1 text-sm text-gray-800 dark:text-gray-200 disabled:opacity-50"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="px-3 py-1 text-sm text-gray-800 dark:text-gray-200 disabled:opacity-50"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        )}

        <UserFormModal
            isOpen={isAddFormOpen}
            onClose={handleCloseModal}
            born={selectedBorn}
        />
        <AddNewBornForm
            isOpen={isAsignFormOpen}
            onClose={handleCloseModal}
            newbordID={IDNewborn}
        />
        <StatusVerification
            isOpen={isVerification}
            onConfirmDelete={handleConfirmDelete}
            onClose={handleCloseModal}
        />
        <DisplayVaccine
            isOpen={isDisplayVaccine}
            onClose={handleCloseModal}
            newbornID={isNewBordId}
        />
    </div>
);
}

export default NewBorn;