import { motion, AnimatePresence } from "framer-motion";
import DisplayVaccine from "../AssignVaccine/DisplayVaccine";
import React, { useState } from "react";
import AddNewBornForm from "../VaccineRecord/AddForm";
import UserFormModal from "../NewBorn/AddNewBorn";
import CheckUpTable from "../CheckUpRecordComponent/CheckupTable";
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 50, scale: 0.95 },
};

const ProfileModal = ({ isOpen, onClose, data }) => {
  // State variables for controlling secondary modals
  const [isDisplayVaccine, setDisplayVaccine] = useState(false);
  const [newbornIdForDisplay, setNewbornIdForDisplay] = useState("");
  const [newbornIdForAssign, setNewbornIdForAssign] = useState("");
  const [isAssignFormOpen, setAssignFormOpen] = useState(false);
  const [selectedBornForEdit, setSelectedBornForEdit] = useState(null);
  const [isUserFormModalOpen, setUserFormModalOpen] = useState(false);
  const [isCheckupFormOpen, setCheckupFormOpen] = useState(false);

  // Destructure data, providing default empty strings for safety
  const { fullName = "", _id = "" } = data || {};

  // Handler to open the Display Vaccine modal
  const handleDisplayVaccine = () => {
    onClose(); // Close the current modal
    setDisplayVaccine(true);
    setNewbornIdForDisplay(_id);
  };

  // Handler to open the Assign Vaccine form
  const handleAssignVaccine = () => {
    onClose(); // Close the current modal
    setNewbornIdForAssign(_id);
    setAssignFormOpen(true);
  };

  // Handler to open the Edit Info form
  const handleEditInfo = (user) => {
    onClose(); // Close the current modal
    setSelectedBornForEdit(user);
    setUserFormModalOpen(true);
  };

  // Handler to close all secondary modals
  const handleCloseSecondaryModals = () => {
    setDisplayVaccine(false);
    setAssignFormOpen(false);
    setUserFormModalOpen(false);
    setSelectedBornForEdit(null);
    setCheckupFormOpen(false);
  };

  // Handler to open the Check-Up Visit table/form
  const handleCheckUpVisit = () => {
    onClose(); // Close the current modal
    setCheckupFormOpen(true);
  };

  return (
    <>
      {/* AnimatePresence manages the mounting/unmounting of the modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose} // Close modal when clicking outside
          >
            <motion.div
              className="relative mx-auto w-full max-w-xs overflow-hidden rounded-xl bg-white p-6 shadow-lg sm:max-w-md dark:bg-gray-800 dark:shadow-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
              {/* Close button for the modal */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-2xl font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                &times;
              </button>

              {/* Modal content: Title and action buttons */}
              <div className="flex flex-col items-center">
                <h2 className="mb-6 text-xl font-semibold text-gray-800 sm:text-2xl dark:text-white text-center">
                  Actions for {fullName || "Newborn"}
                </h2>

                {/* Container for action buttons */}
                <div className="flex w-full flex-col space-y-3">
                  <button
                    onClick={handleCheckUpVisit}
                    className="w-full transform rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                  >
                    Visit Entry
                  </button>
                  <button
                    onClick={handleDisplayVaccine}
                    className="w-full transform rounded-full bg-purple-500 px-4 py-2 text-sm font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-800"
                  >
                    Vaccine Checklist
                  </button>
                  <button
                    onClick={handleAssignVaccine}
                    className="w-full transform rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                  >
                    Assign Vaccine
                  </button>
                  <button
                    onClick={() => handleEditInfo(data)}
                    className="w-full transform rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Edit Info
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary Modals/Components */}
      <DisplayVaccine
        isOpen={isDisplayVaccine}
        onClose={handleCloseSecondaryModals}
        newbornID={newbornIdForDisplay}
      />

      <AddNewBornForm
        isOpen={isAssignFormOpen}
        onClose={handleCloseSecondaryModals}
        newbordID={newbornIdForAssign}
      />

      <UserFormModal
        isOpen={isUserFormModalOpen}
        onClose={handleCloseSecondaryModals}
        born={selectedBornForEdit}
      />

      <CheckUpTable
        isOpen={isCheckupFormOpen}
        onClose={handleCloseSecondaryModals}
        newbornData={data}
      />
    </>
  );
};

export default ProfileModal;
