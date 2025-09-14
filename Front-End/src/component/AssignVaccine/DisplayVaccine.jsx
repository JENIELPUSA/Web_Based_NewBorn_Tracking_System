import { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Syringe, CheckCircle, XCircle, Plus, TrashIcon, PencilIcon } from "lucide-react";
import { VaccinePerContext } from "../../contexts/PerBabyVacine/PerBabyVacineContext";
import AddNewForm from "../AssignVaccine/AddNewForm";
import StatusVerification from "../../ReusableFolder/StatusModal";

const DisplayVaccine = ({ isOpen, onClose, newbornID }) => {
    const { isPerVaccine, setPerVaccine, removeAssignedVaccine } = useContext(VaccinePerContext);
    const [isAssignFormOpen, setAssignFormOpen] = useState(false);
    const [selectedNewbornID, setSelectedNewbornID] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [isVerification, setVerification] = useState(false);
    const [deleteId, setDeleteID] = useState("");
    const [isSelectedAssign, setSelectedAssign] = useState("");

    useEffect(() => {
        if (Array.isArray(isPerVaccine) && newbornID) {
            const result = isPerVaccine.filter((item) => String(item.newborn).trim() === String(newbornID).trim());
            setFilteredData(result);
        } else {
            setFilteredData([]);
        }
    }, [isPerVaccine, newbornID]);

    const handleDeleteAssign = async (newAssignID) => {
        console.log(newAssignID);
        setVerification(true);
        setDeleteID(newAssignID);
    };

    const handleConfirmDelete = async () => {
        await removeAssignedVaccine(deleteId);
        setVerification(false); // Close the confirmation modal
        setDeleteID("");
        // Call your delete API or context method here
        handleCloseModal();
    };

    const handleAssign = (id) => {
        setAssignFormOpen(true);
        setSelectedNewbornID(id);
    };

    const handleCloseModal = () => {
        setAssignFormOpen(false);
        setSelectedAssign("");
    };

    const addVaccineHandler = (newVaccineData) => {
        setPerVaccine((prevData) => [...prevData, newVaccineData]);
        setAssignFormOpen(false);
    };

    const onVaccineSelect = (data) => {
        console.log(data);
        setAssignFormOpen(true);
        setSelectedAssign(data);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <button
                    className="absolute right-3 top-3 text-xl text-gray-500 transition-all duration-200 hover:scale-110 hover:text-red-500"
                    onClick={onClose}
                >
                    <XCircle className="h-6 w-6" />
                </button>

                <h2 className="mb-6 text-2xl font-bold text-gray-800">Vaccine Check List</h2>

                <div className="space-y-4">
                    {filteredData.length > 0 ? (
                        filteredData.map((vaccine, index) => (
                            <motion.div
                                key={vaccine._id || index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.01 }}
                                className="relative rounded-lg border border-gray-300 p-4 shadow-md transition-all duration-200 hover:shadow-lg"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Stepper Indicator */}
                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className={`rounded-full p-1 transition-colors duration-200 ${
                                                vaccine.status === "Completed"
                                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                    : vaccine.status === "Overdose"
                                                    ? "bg-red-100 text-red-600 hover:bg-red-200" // Overdose condition styling
                                                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                            }`}
                                            title={vaccine.status}
                                        >
                                            {vaccine.status === "Completed" ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : vaccine.status === "Overdose" ? (
                                                <XCircle className="h-5 w-5" /> // Overdose icon (XCircle for warning)
                                            ) : (
                                                <Syringe className="h-5 w-5" />
                                            )}
                                        </motion.div>
                                        {index < filteredData.length - 1 && <div className="my-1 h-6 w-[2px] bg-gray-300" />}
                                    </div>

                                    {/* Vaccine Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 transition-colors duration-200 hover:text-blue-600">
                                            {vaccine.vaccineName}
                                        </h3>
                                        <p className="text-sm text-gray-600">{vaccine.description}</p>

                                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
                                            <span className="transition-colors duration-200 hover:text-blue-600">
                                                Total Doses: {vaccine.totalDoses}
                                            </span>
                                            <span className="transition-colors duration-200 hover:text-blue-600">
                                                Doses Given: {vaccine.dosesGiven}
                                            </span>
                                            <span
                                                className={`font-medium ${
                                                    vaccine.status === "Completed"
                                                        ? "text-green-600 hover:text-green-700"
                                                        : vaccine.status === "Overdose"
                                                        ? "text-red-600 hover:text-red-700" // Overdose status
                                                        : "text-blue-600 hover:text-blue-700"
                                                } transition-colors duration-200`}
                                            >
                                                Status: {vaccine.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-1">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onVaccineSelect(vaccine)}
                                            className="rounded bg-blue-500 px-2 py-1 text-white transition-colors duration-200 hover:bg-blue-600"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDeleteAssign(vaccine.assignedVaccineId)}
                                            className="rounded bg-red-500 px-2 py-1 text-white transition-colors duration-200 hover:bg-red-600"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-500"
                        >
                            No vaccine records found.
                        </motion.p>
                    )}

                    {/* Assign New Vaccine Button */}
                    <div className="pt-4 text-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAssign(newbornID)}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Add New Vaccine
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <AddNewForm
                isOpen={isAssignFormOpen}
                onClose={handleCloseModal}
                idBorn={selectedNewbornID}
                onAddVaccine={addVaccineHandler}
                editData={isSelectedAssign}
            />

            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={() => setVerification(false)}
            />
        </motion.div>
    );
};

export default DisplayVaccine;