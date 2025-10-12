import React, { useState, useEffect } from 'react';
import MessageBox from './MessageBox';
import NewbornForm from './NewbornForm';
import NewbornCard from './NewbornCard';
import NewbornDetailPanel from './NewbornDetailPanel';
import BabyCodeModal from './BabyCodeModal';

function ParentDashboard({ setClearDataTrack }) {
  const [newborns, setNewborns] = useState([]);
  const [selectedNewborn, setSelectedNewborn] = useState(null);
  const [pendingNewborn, setPendingNewborn] = useState(null);
  const [showBabyCodeModal, setShowBabyCodeModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isDropZoneHovered, setIsDropZoneHovered] = useState(false);
  const [theme] = useState('light');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const closeMessage = () => setMessage('');

  const addNewborn = (newbornData) => {
    const newId = `newborn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNewborn = { ...newbornData, id: newId, vaccines: [] };
    setNewborns(prev => [...prev, newNewborn]);
    showMessage('Newborn successfully saved!', 'success');
  };

  const deleteNewborn = (newbornId) => {
    setNewborns(prev => prev.filter(nb => nb.id !== newbornId));
    setSelectedNewborn(null);
    showMessage('Newborn successfully deleted.', 'success');
  };

  const addVaccine = (newbornId, vaccineData) => {
    setNewborns(prev =>
      prev.map(newborn => {
        if (newborn.id === newbornId) {
          const newVaccineId = `vaccine-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const newVaccine = { ...vaccineData, id: newVaccineId, status: 'incoming' };
          return { ...newborn, vaccines: [...newborn.vaccines, newVaccine] };
        }
        return newborn;
      })
    );
    showMessage('Vaccine successfully added!', 'success');
  };

  const updateVaccineStatus = (newbornId, vaccineId, newStatus, administeredDate = null) => {
    setNewborns(prev =>
      prev.map(newborn => {
        if (newborn.id === newbornId) {
          return {
            ...newborn,
            vaccines: newborn.vaccines.map(v =>
              v.id === vaccineId ? { ...v, status: newStatus, administeredDate } : v
            ),
          };
        }
        return newborn;
      })
    );
    showMessage(`Vaccine status successfully updated to ${newStatus === 'history' ? 'History' : 'Incoming'}!`, 'success');
  };

  const deleteVaccine = (newbornId, vaccineId) => {
    setNewborns(prev =>
      prev.map(newborn => {
        if (newborn.id === newbornId) {
          return {
            ...newborn,
            vaccines: newborn.vaccines.filter(v => v.id !== vaccineId),
          };
        }
        return newborn;
      })
    );
    showMessage('Vaccine successfully deleted.', 'success');
  };

  // 🧩 Drag logic
  const handleDragOverDropZone = (e) => {
    e.preventDefault();
    setIsDropZoneHovered(true);
  };

  const handleDragLeaveDropZone = () => {
    setIsDropZoneHovered(false);
  };

  const handleDropNewborn = (e) => {
    e.preventDefault();
    setIsDropZoneHovered(false);
    const newbornId = e.dataTransfer.getData('newbornId');
    const droppedNewborn = newborns.find(nb => nb.id === newbornId);

    if (droppedNewborn) {
      handleSelectNewborn(droppedNewborn); // ✅ Unified logic
    } else {
      showMessage('That newborn could not be found.', 'error');
    }
  };

  // ✅ Unified selection logic for both click and drag
  const handleSelectNewborn = (newborn) => {
    if (newborn.babyCodeNumber) {
      // Baby code already exists → show details immediately
      setSelectedNewborn(newborn);
    } else {
      // No baby code → show modal first
      setPendingNewborn(newborn);
      setShowBabyCodeModal(true);
    }
  };

  // ✅ When Baby Code Modal is saved
  const handleSaveBabyCode = (babyCodeNumber) => {
    setNewborns(prev =>
      prev.map(nb =>
        nb.id === pendingNewborn.id ? { ...nb, babyCodeNumber } : nb
      )
    );
    setShowBabyCodeModal(false);
    setSelectedNewborn({ ...pendingNewborn, babyCodeNumber });
    setPendingNewborn(null);
    showMessage(`Baby Code Number saved for ${pendingNewborn.newbornName}.`, 'success');
  };

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  useEffect(() => {
    if (selectedNewborn) {
      const updated = newborns.find(nb => nb.id === selectedNewborn.id);
      setSelectedNewborn(updated || null);
    }
  }, [newborns, selectedNewborn]);

  return (
    <div className="font-inter flex flex-col items-center transition-colors duration-300">
      <MessageBox message={message} type={messageType} onClose={closeMessage} />

      <main className="w-full shadow-md rounded-xl p-6 transition-colors duration-300 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-700">Our Newborns</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setSelectedNewborn(null);
              setClearDataTrack(true);
            }}
            className="bg-red-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105"
          >
            {showForm ? 'Close Form' : 'Add Newborn'}
          </button>
        </div>

        {showForm && <NewbornForm onSave={() => setShowForm(false)} onAddNewborn={addNewborn} />}

        {!showForm && newborns.length === 0 && (
          <div className="text-center text-xl py-10 text-gray-500">
            No newborns registered yet. Add one!
          </div>
        )}

        {!showForm && newborns.length > 0 && (
          <>
            {!isTouchDevice && (
              <div
                onDragOver={handleDragOverDropZone}
                onDragLeave={handleDragLeaveDropZone}
                onDrop={handleDropNewborn}
                className={`max-w-2xl mx-auto p-6 mb-8 border-4 border-dashed rounded-xl text-center transition-all ${
                  isDropZoneHovered
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <p className="text-xl font-bold mb-2 text-gray-700">
                  Drag Newborn Card Here
                </p>
                <p className="text-gray-600">
                  To view full details and vaccination schedule
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newborns.map(newborn => (
                <NewbornCard
                  key={newborn.id}
                  newborn={newborn}
                  onSelect={handleSelectNewborn} // ✅ Updated to use unified handler
                />
              ))}
            </div>
          </>
        )}

        {selectedNewborn && (
          <NewbornDetailPanel
            newborn={selectedNewborn}
            onClose={() => setSelectedNewborn(null)}
            onDeleteNewborn={deleteNewborn}
            onAddVaccine={addVaccine}
            onUpdateVaccineStatus={updateVaccineStatus}
            onDeleteVaccine={deleteVaccine}
            setClearDataTrack={setClearDataTrack}
          />
        )}

        <BabyCodeModal
          isOpen={showBabyCodeModal}
          onClose={() => {
            setShowBabyCodeModal(false);
            setPendingNewborn(null);
          }}
          onSave={handleSaveBabyCode}
        />
      </main>
    </div>
  );
}

export default ParentDashboard;