import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";
import axios from "axios";

function AddVacine({ isOpen, onClose, vaccine, bybatch }) {
    const { customError, VaccineAdd, UpdateData } = useContext(VaccineDisplayContext);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        dosage: "",
        brand: "",
        stock: 0,
        expirationDate: "",
        zone: "",
    });

    const [vaccineId, setVaccineId] = useState("");
    const [batchId, setBatchId] = useState("");

    const [brands, setBrands] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownOpenDosage, setDropdownOpenDosage] = useState(false);

    const dosageOptions = ["0.5 mL", "1.0 mL", "10 mcg", "20 mcg"];

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            dosage: "",
            brand: "",
            stock: 0,
            expirationDate: "",
            zone: "",
        });
        setVaccineId("");
        setBatchId("");
    };

    const handleCls = () => {
        resetForm();
        onClose();
    };

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Brand`);
                setBrands(res.data.data || []);
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        if (vaccine && bybatch) {
            setFormData({
                name: vaccine?.name || "",
                description: vaccine?.description || "",
                dosage: vaccine?.dosage || "",
                brand: vaccine?.brand?._id || "",
                stock: bybatch.stock ?? 0, // Use bybatch.stock, fallback to 0
                expirationDate: bybatch?.expirationDate ? bybatch.expirationDate.split("T")[0] : "",
                zone: vaccine.zone || "",
            });

            setVaccineId(vaccine._id || "");
            setBatchId(bybatch.selectedBatch || "");
        }
    }, [vaccine, bybatch]); //   Don't forget to add bybatch to dependencies

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "stock" ? parseInt(value, 10) : value,
        }));
    };

    const handleCategoryChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fullPayload = {
            ...formData,
            vaccineId,
            batchId,
        };

        console.log("PAYLOAD", fullPayload);

        if (vaccine) {
            await UpdateData(vaccine._id, fullPayload);
            setTimeout(() => {
                resetForm();
                onClose();
            }, 1000);
        } else {
            await VaccineAdd(fullPayload);
            setTimeout(() => {
                resetForm();
                onClose();
            }, 1000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">{vaccine ? "Edit Vaccine" : "Add New Vaccine"}</h2>

                {customError && <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">{customError}</div>}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Vaccine Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Dosage Dropdown */}
                        <div className="relative w-full">
                            <label className="mb-1 block text-sm text-slate-600">Dosage</label>
                            <div
                                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                                onClick={() => setDropdownOpenDosage(!dropdownOpenDosage)}
                            >
                                <span>{formData.dosage || "Select Dosage"}</span>
                                <i className={`fas ${dropdownOpenDosage ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                            </div>
                            {dropdownOpenDosage && (
                                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white text-sm">
                                    <li
                                        className="cursor-pointer px-3 py-2 hover:bg-slate-100"
                                        onClick={() => {
                                            handleCategoryChange({ target: { name: "dosage", value: "" } });
                                            setDropdownOpenDosage(false);
                                        }}
                                    >
                                        Select Dosage
                                    </li>
                                    {dosageOptions.map((dosage, i) => (
                                        <li
                                            key={i}
                                            className="cursor-pointer px-3 py-2 hover:bg-slate-100"
                                            onClick={() => {
                                                handleCategoryChange({ target: { name: "dosage", value: dosage } });
                                                setDropdownOpenDosage(false);
                                            }}
                                        >
                                            {dosage}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Brand Dropdown */}
                        <div className="relative w-full">
                            <label className="mb-1 block text-sm text-slate-600">Brand</label>
                            <div
                                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <span>{formData.brand ? brands.find((b) => b._id === formData.brand)?.name || "Select Brand" : "Select Brand"}</span>
                                <i className={`fas ${dropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                            </div>
                            {dropdownOpen && (
                                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white text-sm">
                                    <li
                                        className="cursor-pointer px-3 py-2 hover:bg-slate-100"
                                        onClick={() => {
                                            handleCategoryChange({ target: { name: "brand", value: "" } });
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        Select Brand
                                    </li>
                                    {brands.map((brand) => (
                                        <li
                                            key={brand._id}
                                            className="cursor-pointer px-3 py-2 hover:bg-slate-100"
                                            onClick={() => {
                                                handleCategoryChange({ target: { name: "brand", value: brand._id } });
                                                setDropdownOpen(false);
                                            }}
                                        >
                                            {brand.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Zone</label>
                            <input
                                type="text"
                                name="zone"
                                value={formData.zone}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Expiration Date</label>
                        <input
                            type="date"
                            name="expirationDate"
                            value={formData.expirationDate}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    {/* Optional Debug Info */}
                    <div className="mt-2 text-xs text-gray-500">
                        <p>
                            <strong>Vaccine ID:</strong> {vaccineId}
                        </p>
                        <p>
                            <strong>Batch ID:</strong> {batchId}
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleCls}
                            className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
                        >
                            {vaccine ? "Update Vaccine" : "Add Vaccine"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddVacine;
