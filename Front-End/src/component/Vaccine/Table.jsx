import React, { useState, useContext } from "react";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import UserFormModal from "../Vaccine/AddVacine";
import UpdateFormModal from "../Vaccine/UpdateStock";
import DeleteForm from "../Vaccine/DeleteStocks";

function VaccineTable() {
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isUpdateFormOpen, setUpdateFormOpen] = useState(false);
    const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);

    const { vaccine } = useContext(VaccineDisplayContext);
    const vaccinesPerPage = 5;

    const groupedVaccines = vaccine.reduce((acc, item) => {
        const { _id, name, brand, description, dosage, zone, batches } = item;

        if (!acc[name]) {
            acc[name] = {
                _id,
                name,
                totalStock: 0,
                description,
                dosage,
                zone,
                details: [],
            };
        }

        batches.forEach((batch) => {
            acc[name].totalStock += batch.stock;
            acc[name].details.push({
                label: `${brand?.name || "N/A"} (${new Date(batch.expirationDate).toISOString().split("T")[0]})`,
                batchID: batch._id,
                stock: batch.stock,
            });
        });

        return acc;
    }, {});

    const groupedVaccineArray = Object.values(groupedVaccines);
    const filteredVaccines = groupedVaccineArray.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredVaccines.length / vaccinesPerPage);
    const indexOfLast = currentPage * vaccinesPerPage;
    const indexOfFirst = indexOfLast - vaccinesPerPage;
    const currentVaccines = filteredVaccines.slice(indexOfFirst, indexOfLast);

    const openAddModal = () => {
        setSelectedVaccine(null);
        setAddFormOpen(true);
    };

    const openUpdateModal = (vaccine) => {
        setSelectedVaccine(vaccine);
        setUpdateFormOpen(true);
    };

    const openDeleteModal = (vaccine) => {
        setSelectedVaccine(vaccine);
        setDeleteFormOpen(true);
    };

    const handleCloseAllModals = () => {
        setSelectedVaccine(null);
        setAddFormOpen(false);
        setUpdateFormOpen(false);
        setDeleteFormOpen(false);
    };

    return (
        <div className="card m-4">
            <div className="card-header mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="card-title text-xl font-semibold dark:text-white">Vaccine List</p>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        placeholder="Search vaccines..."
                        className="input input-sm w-full rounded-md border px-3 py-1 text-sm dark:bg-slate-800 dark:text-white sm:w-56"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                   {/* Add button on XS screens */}
                            <div className="mt-4 flex justify-center sm:hidden">
                                <button
                                    onClick={openAddModal}
                                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add New Born
                                </button>
                            </div>
                </div>
            </div>

            <div className="card-body p-0">
                <div className="relative w-full overflow-auto">
                    {/* Table for larger screens */}
                    <div className="hidden sm:block">
                        <table className="table w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                                <tr>
                                    <th className="p-3 text-left">#</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Description</th>
                                    <th className="p-3 text-left">Stock</th>
                                    <th className="p-3 text-left">Zone</th>
                                    <th className="p-3 text-left">Dosage</th>
                                    <th className="p-3 text-left">Brand/Expiration</th>
                                    <th className="hidden p-3 text-left sm:table-cell">
                                        <button
                                            onClick={openAddModal}
                                            className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                            title="Add Vaccine"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentVaccines.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="p-4 text-center dark:text-gray-300"
                                        >
                                            No vaccines found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentVaccines.map((item, index) => (
                                        <tr
                                            key={item.name}
                                            className="border-b dark:border-gray-700 dark:text-white"
                                        >
                                            <td className="p-3 align-top">{indexOfFirst + index + 1}</td>
                                            <td className="p-3 align-top capitalize">{item.name}</td>
                                            <td className="p-3 align-top capitalize">{item.description}</td>
                                            <td className="p-3 align-top">{item.totalStock}</td>
                                            <td className="p-3 align-top">{item.zone}</td>
                                            <td className="p-3 align-top">{item.dosage}</td>
                                            <td className="p-3 align-top">
                                                {item.details?.length > 0 ? (
                                                    item.details.map((detail, i) => <div key={i}>{detail.label}</div>)
                                                ) : (
                                                    <span>No Details</span>
                                                )}
                                            </td>
                                            <td className="p-3 align-top">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openUpdateModal(item)}
                                                        className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                        title="Edit Stock"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(item)}
                                                        className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                        title="Delete Stock"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card layout for mobile screens */}
                    <div className="grid grid-cols-1 gap-4 p-2 sm:hidden">
                        {currentVaccines.map((item) => (
                            <div
                                key={item._id}
                                className="rounded-md border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                <p>{item.description}</p>
                                <p>
                                    <strong>Stock:</strong> {item.totalStock}
                                </p>
                                <p>
                                    <strong>Zone:</strong> {item.zone}
                                </p>
                                <p>
                                    <strong>Dosage:</strong> {item.dosage}
                                </p>
                                <div className="mt-1 text-sm">
                                    {item.details?.map((detail, i) => (
                                        <p key={i}>{detail.label}</p>
                                    ))}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => openUpdateModal(item)}
                                        className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(item)}
                                        className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 text-sm dark:text-gray-300">
                        <button
                            className="px-3 py-1 disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="px-3 py-1 disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Modals */}
                <UserFormModal
                    isOpen={isAddFormOpen}
                    isAddStock={true}
                    vaccine={null}
                    onClose={handleCloseAllModals}
                />
                <UpdateFormModal
                    isOpen={isUpdateFormOpen}
                    vaccine={selectedVaccine}
                    onClose={handleCloseAllModals}
                />
                <DeleteForm
                    vaccine={selectedVaccine}
                    isOpen={isDeleteFormOpen}
                    onClose={handleCloseAllModals}
                />
            </div>
        </div>
    );
}

export default VaccineTable;
