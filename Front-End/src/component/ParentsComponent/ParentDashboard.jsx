import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';

const MessageContext = createContext(null);

const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center justify-between z-50 animate-fade-in" style={{
      backgroundColor: type === 'error' ? '#ef4444' : '#22c55e',
      color: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    }}>
      <p className="font-semibold text-lg">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
        aria-label="Close message"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

function ParentDashboard() {
  const [newborns, setNewborns] = useState([]);
  const [selectedNewborn, setSelectedNewborn] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isDropZoneHovered, setIsDropZoneHovered] = useState(false);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const closeMessage = () => {
    setMessage('');
  };

  const addNewborn = (newbornData) => {
    const newId = `newborn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNewborn = { ...newbornData, id: newId, vaccines: [] };
    setNewborns(prev => [...prev, newNewborn]);
    showMessage('Matagumpay na na-save ang bagong silang!', 'success');
  };

  const deleteNewborn = (newbornId) => {
    setNewborns(prev => prev.filter(nb => nb.id !== newbornId));
    setSelectedNewborn(null);
    showMessage('Matagumpay na natanggal ang bagong silang.', 'success');
  };

  const addVaccine = (newbornId, vaccineData) => {
    setNewborns(prevNewborns => prevNewborns.map(newborn => {
      if (newborn.id === newbornId) {
        const newVaccineId = `vaccine-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newVaccine = { ...vaccineData, id: newVaccineId, status: 'incoming' };
        return { ...newborn, vaccines: [...newborn.vaccines, newVaccine] };
      }
      return newborn;
    }));
    showMessage(`Matagumpay na naidagdag ang bakuna!`, 'success');
  };

  const updateVaccineStatus = (newbornId, vaccineId, newStatus, administeredDate = null) => {
    setNewborns(prevNewborns => prevNewborns.map(newborn => {
      if (newborn.id === newbornId) {
        return {
          ...newborn,
          vaccines: newborn.vaccines.map(vaccine => {
            if (vaccine.id === vaccineId) {
              return { ...vaccine, status: newStatus, administeredDate: administeredDate };
            }
            return vaccine;
          })
        };
      }
      return newborn;
    }));
    showMessage(`Matagumpay na na-update ang status ng bakuna sa ${newStatus === 'history' ? 'Kasaysayan' : 'Paparating'}!`, 'success');
  };

  const deleteVaccine = (newbornId, vaccineId) => {
    setNewborns(prevNewborns => prevNewborns.map(newborn => {
      if (newborn.id === newbornId) {
        return { ...newborn, vaccines: newborn.vaccines.filter(v => v.id !== vaccineId) };
      }
      return newborn;
    }));
    showMessage('Matagumpay na natanggal ang bakuna.', 'success');
  };

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
      setSelectedNewborn(droppedNewborn);
      showMessage(`Ang detalye ni ${droppedNewborn.name} ay ipinapakita.`, 'success');
    } else {
      showMessage('Hindi makita ang bagong silang na iyan.', 'error');
    }
  };

  useEffect(() => {
    if (selectedNewborn) {
      const updatedSelected = newborns.find(nb => nb.id === selectedNewborn.id);
      if (updatedSelected) {
        setSelectedNewborn(updatedSelected);
      } else {
        setSelectedNewborn(null);
      }
    }
  }, [newborns, selectedNewborn]);

  return (
    <MessageContext.Provider value={{ showMessage }}>
      <div className="min-h-screen bg-gray-100 font-inter text-gray-800 flex flex-col items-center p-4">
        <MessageBox message={message} type={messageType} onClose={closeMessage} />

        <header className="w-full max-w-4xl bg-white shadow-md rounded-xl p-6 mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">Newborn Tracker</h1>
          <p className="text-lg text-gray-600">
            Ang iyong kasama sa pagsubaybay sa impormasyon at bakuna ng iyong sanggol.
          </p>
        </header>

        <main className="w-full max-w-4xl bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-700">Ating mga Bagong Silang</h2>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setSelectedNewborn(null);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105"
            >
              {showForm ? 'Isara ang Form' : 'Magdagdag ng Bagong Silang'}
            </button>
          </div>

          {showForm && <NewbornForm onSave={() => setShowForm(false)} onAddNewborn={addNewborn} />}

          {!showForm && newborns.length === 0 && (
            <div className="text-center text-gray-500 text-xl py-10">
              Walang bagong silang na nakarehistro. Magdagdag ng bago!
            </div>
          )}

          {!showForm && newborns.length > 0 && (
            <>
              <div
                onDragOver={handleDragOverDropZone}
                onDragLeave={handleDragLeaveDropZone}
                onDrop={handleDropNewborn}
                className={`p-8 mb-8 border-4 border-dashed rounded-xl text-center transition-all ${isDropZoneHovered ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
              >
                <p className="text-xl font-bold mb-2 text-gray-700">I-drag ang Newborn Card Dito</p>
                <p className="text-gray-600">Para Makita ang Buong Detalye at Iskedyul ng Bakuna</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newborns.map(newborn => (
                  <NewbornCard
                    key={newborn.id}
                    newborn={newborn}
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
            />
          )}
        </main>
      </div>
    </MessageContext.Provider>
  );
}

const NewbornForm = ({ onSave, onAddNewborn }) => {
  const { showMessage } = useContext(MessageContext);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [parentName, setParentName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !birthDate || !gender || !parentName || !address) {
      showMessage('Paki-fill up ang lahat ng field.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      onAddNewborn({
        name,
        birthDate,
        gender,
        parentName,
        address,
        createdAt: new Date().toISOString(),
      });
      setName('');
      setBirthDate('');
      setGender('');
      setParentName('');
      setAddress('');
      onSave();
    } catch (e) {
      console.error("Error adding newborn:", e);
      showMessage('Nabigo ang pag-save ng bagong silang. Pakisubukang muli.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
      <h3 className="text-2xl font-bold text-gray-700 mb-4">Magdagdag ng Bagong Silang</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Pangalan</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Petsa ng Kapanganakan</label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Pangalan ng Magulang</label>
          <input
            type="text"
            id="parentName"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Kasarian</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Pumili ng Kasarian</option>
            <option value="Male">Lalaki</option>
            <option value="Female">Babae</option>
            <option value="Other">Iba pa</option>
          </select>
        </div>
        <div className="col-span-1 md:col-span-2 flex justify-end">
          <button
            type="submit"
            className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition transform ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Nagse-save...' : 'I-save ang Bagong Silang'}
          </button>
        </div>
      </form>
    </div>
  );
};

const NewbornCard = ({ newborn }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('newbornId', newborn.id);
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      className="bg-white p-6 rounded-xl shadow-lg cursor-grab active:cursor-grabbing transition transform hover:scale-105 border border-gray-200"
    >
      <h3 className="text-2xl font-bold text-blue-700 mb-2">{newborn.name}</h3>
      <p className="text-gray-600">
        <span className="font-semibold">Kapanganakan:</span> {newborn.birthDate}
      </p>
      <p className="text-gray-600">
        <span className="font-semibold">Kasarian:</span> {newborn.gender}
      </p>
      <div className="mt-4 text-sm font-semibold text-gray-500">
        I-drag papunta sa "I-drag ang Newborn Card Dito" para makita ang detalye.
      </div>
    </div>
  );
};

const NewbornDetailPanel = ({ newborn, onClose, onDeleteNewborn, onAddVaccine, onUpdateVaccineStatus, onDeleteVaccine }) => {
  const { showMessage } = useContext(MessageContext);
  const incomingVaccines = newborn.vaccines.filter(v => v.status === 'incoming').sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  const historyVaccines = newborn.vaccines.filter(v => v.status === 'history').sort((a, b) => new Date(b.administeredDate) - new Date(a.administeredDate));

  const [newVaccineName, setNewVaccineName] = useState('');
  const [newVaccineDate, setNewVaccineDate] = useState('');
  const [draggedVaccine, setDraggedVaccine] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  const handleAddVaccine = (e) => {
    e.preventDefault();
    if (!newVaccineName || !newVaccineDate) {
      showMessage('Paki-fill up ang pangalan at petsa ng bakuna.', 'error');
      return;
    }
    onAddVaccine(newborn.id, { name: newVaccineName, scheduledDate: newVaccineDate });
    setNewVaccineName('');
    setNewVaccineDate('');
  };

  const handleDragStart = (e, vaccine) => {
    setDraggedVaccine(vaccine);
    e.dataTransfer.setData('vaccineId', vaccine.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedVaccine) return;

    const administeredDate = targetStatus === 'history' ? new Date().toISOString().split('T')[0] : null;
    onUpdateVaccineStatus(newborn.id, draggedVaccine.id, targetStatus, administeredDate);
    setDraggedVaccine(null);
  };

  const handleDeleteNewborn = () => {
    if (window.confirm(`Sigurado ka bang gusto mong tanggalin si ${newborn.name} at ang lahat ng kanyang vaccine records?`)) {
      onDeleteNewborn(newborn.id);
      onClose();
    }
  };

  const handleDeleteVaccine = (vaccineId, vaccineName) => {
    if (window.confirm(`Sigurado ka bang gusto mong tanggalin ang bakunang ${vaccineName}?`)) {
      onDeleteVaccine(newborn.id, vaccineId);
    }
  };

  const handleAdministerVaccine = (vaccineId, vaccineName) => {
    if (window.confirm(`Markahan ang bakunang ${vaccineName} bilang naibigay na?`)) {
      onUpdateVaccineStatus(newborn.id, vaccineId, 'history', new Date().toISOString().split('T')[0]);
    }
  };

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: date }, (_, i) => i + 1);
  }, [currentMonth]);

  const firstDayOfMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dayIndex = new Date(year, month, 1).getDay();
    return dayIndex === 0 ? 6 : dayIndex - 1;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleString('tl-PH', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const getVaccinesForDate = (date) => {
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
    const dateString = dateObj.toISOString().split('T')[0];
    return incomingVaccines.filter(v => v.scheduledDate === dateString);
  };

  return (
    <div className="mt-8 bg-blue-50 p-6 rounded-xl shadow-inner">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-3xl font-bold text-blue-700">Buong Detalye ni {newborn.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteNewborn}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-105"
          >
            Tanggalin si {newborn.name}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-105"
          >
            Isara
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <p className="text-lg mb-2"><span className="font-semibold">Pangalan:</span> {newborn.name}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Petsa ng Kapanganakan:</span> {newborn.birthDate}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Kasarian:</span> {newborn.gender}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Pangalan ng Magulang:</span> {newborn.parentName}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Address:</span> {newborn.address}</p>
        <p className="text-lg"><span className="font-semibold">ID:</span> <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded-md">{newborn.id}</span></p>
      </div>

      <h4 className="text-2xl font-bold text-gray-700 mb-4">Magdagdag ng Bakuna</h4>
      <form onSubmit={handleAddVaccine} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-lg shadow-inner">
        <input
          type="text"
          placeholder="Pangalan ng Bakuna"
          value={newVaccineName}
          onChange={(e) => setNewVaccineName(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <input
          type="date"
          value={newVaccineDate}
          onChange={(e) => setNewVaccineDate(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-105"
        >
          Idagdag ang Bakuna
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-300">
          <h4 className="text-2xl font-bold text-blue-600 mb-4">Paparating na Iskedyul ng Bakuna</h4>

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-lg"
            >
              &lt;
            </button>
            <h5 className="text-xl font-semibold">{monthName}</h5>
            <button
              onClick={() => navigateMonth(1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-lg"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Miy</div>
            <div>Huw</div>
            <div>Biy</div>
            <div>Sab</div>
            <div>Lin</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ))}
            {daysInMonth.map(day => {
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const dateString = dateObj.toISOString().split('T')[0];
              const hasVaccines = incomingVaccines.some(v => v.scheduledDate === dateString);
              const isSelected = selectedCalendarDate === dateString;
              const today = new Date();
              const todayString = today.toISOString().split('T')[0];
              const isToday = dateString === todayString;

              const isPastAndHasIncoming = dateObj < today && hasVaccines && dateString !== todayString;

              return (
                <div
                  key={day}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isToday ? 'bg-blue-200 font-bold' : ''
                  } ${
                    hasVaccines && !isPastAndHasIncoming ? 'bg-blue-400 text-white font-bold' : 'bg-gray-100 hover:bg-gray-200'
                  } ${
                    isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  } ${
                    isPastAndHasIncoming ? 'bg-red-400 text-white font-bold' : ''
                  }`}
                  onClick={() => setSelectedCalendarDate(dateString)}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            <span className="inline-block w-4 h-4 bg-blue-400 rounded-full mr-2"></span> May nakatakdang bakuna.
          </p>
          <p className="text-sm text-gray-600">
            <span className="inline-block w-4 h-4 bg-red-400 rounded-full mr-2"></span> Nakalipas na at may nakatakdang bakuna.
          </p>


          {selectedCalendarDate && (
            <div className="mt-6 p-4 bg-blue-100 rounded-lg shadow-sm">
              <h5 className="text-lg font-bold text-blue-800 mb-3">Mga Bakuna sa {selectedCalendarDate}</h5>
              {getVaccinesForDate(selectedCalendarDate).length === 0 ? (
                <p className="text-gray-600 italic">Walang nakatakdang bakuna para sa petsang ito.</p>
              ) : (
                <ul className="space-y-2">
                  {incomingVaccines.filter(v => v.scheduledDate === selectedCalendarDate).map(vaccine => (
                    <li key={vaccine.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-blue-700">{vaccine.name}</p>
                        <p className="text-sm text-gray-600">Petsa: {vaccine.scheduledDate}</p>
                      </div>
                      <button
                        onClick={() => handleAdministerVaccine(vaccine.id, vaccine.name)}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded-md transition-colors"
                      >
                        Naibigay na
                      </button>
                      <button
                        onClick={() => handleDeleteVaccine(vaccine.id, vaccine.name)}
                        className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Tanggalin ang bakuna"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'history')}
          className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-green-300 min-h-[200px]"
        >
          <h4 className="text-2xl font-bold text-green-600 mb-4">Kasaysayan ng Bakuna</h4>
          {historyVaccines.length === 0 ? (
            <p className="text-gray-500 italic">Walang nakarehistrong bakuna. I-drag ang mga bakuna dito para markahan bilang tapos na.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pangalan ng Bakuna
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Naibigay
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksyon
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historyVaccines.map(vaccine => (
                    <tr
                      key={vaccine.id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, vaccine)}
                      className="hover:bg-green-50 transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-800">{vaccine.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600">{vaccine.administeredDate || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteVaccine(vaccine.id, vaccine.name)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Tanggalin ang bakuna"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
