import React, { useState, useContext } from "react";
import { PencilIcon, TrashIcon, Plus, ShieldCheck } from "lucide-react"; // Lucide icons for clean UI
import UserFormModal from "../NewBorn/AddNewBorn";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
import AddNewBornForm from "../VaccineRecord/AddForm";
import StatusVerification from "../../ReusableFolder/StatusModal"
import DisplayVaccine from "../AssignVaccine/DisplayVaccine";

function NewBorn() {
    const [selectedBorn, setSelectedBorn] = useState(null); // State for the user to be edited
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isAsignFormOpen, setAssignFormOpen] = useState(false);
    const { newBorn, DeleteNewBorn } = useContext(NewBornDisplayContext);
    const [IDNewborn, setIDNewborn] = useState("");
    const [isVerification, setVerification] = useState(false);
    const [deleteId,setDeleteID]=useState("")
    const [isDisplayVaccine,setDisplayVaccine]=useState("")
    const [isNewBordId,setNewBornId]=useState("")

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
         setDeleteID(newbordID)   
    };
        const handleConfirmDelete =async() => {
         await DeleteNewBorn(deleteId);
        setUsers((prevUsers) => {
            const updated = prevUsers.filter((user) => user._id !== deleteId);
            return updated;
        });
        // Call your delete API or context method here
        handleCloseModal();
    };

    const onBornSelect = (user) => {
        setAddFormOpen(true);
        setSelectedBorn(user);
    };

    const handleAsign = (Data) => {
        setIDNewborn(Data); // assign selected ID
        setAssignFormOpen(true);
    };
    const handleDisplayVaccine=(data)=>{
           setDisplayVaccine(true)
           setNewBornId(data)
    }

    return (
        <div className="card">
            <div className="card-header flex items-center justify-between">
                <p className="card-title">New Born List</p>
                <input
                    type="text"
                    placeholder="Search users..."
                    className="input input-sm w-56 rounded-md border px-3 py-1 text-sm dark:bg-slate-800"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>
            <div className="card-body p-0">
                <div className="relative h-[500px] w-full overflow-auto">
                    <table className="table w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
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
                                <th>
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
                                    <td
                                        colSpan="10"
                                        className="p-4 text-center"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((newBorn, index) => (
                                    <tr
                                        key={newBorn._id} //Fix key warning here
                                        className="border-b dark:border-gray-700"
                                    >
                                        <td className="p-3 align-top">{indexOfFirstUser + index + 1}</td>
                                        <td className="p-3 align-top">
                                            <img
                                                src={newBorn.avatar}
                                                alt={newBorn.fullName || "Newborn"}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        </td>
                                        <td className="p-3 align-top">{newBorn.fullName}</td>
                                        <td className="p-3 align-top">{newBorn.gender}</td>
                                        <td className="p-3 align-top">{newBorn.dateOfBirth}</td>
                                        <td className="p-3 align-top">{newBorn.address}</td>
                                        <td className="p-3 align-top">{newBorn.birthWeight}</td>
                                        <td className="p-3 align-top">{newBorn.birthHeight}</td>
                                        <td className="p-3 align-top">{newBorn.motherName}</td>
                                        <td className="p-3 align-top">{newBorn.phoneNumber}</td>
                                        <td className="p-3 align-top capitalize">{newBorn.addedByName}</td>
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
                                                        Delet New Born
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            className="px-3 py-1 text-sm disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="px-3 py-1 text-sm disabled:opacity-50"
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
        </div>
    );
}

export default NewBorn;
