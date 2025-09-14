import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";
import axios from "axios";

function AddVacine({ isOpen, onClose, vaccine, bybatch }) {
    const { customError, VaccineAdd, UpdateData } = useContext(VaccineDisplayContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        dosage: "",
        brand: "",
        stock: 0,
        expirationDate: "",
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

    console.log("BatchID",batchId)

    useEffect(() => {
        if (vaccine && bybatch) {
            setFormData({
                name: vaccine?.name || "",
                description: vaccine?.description || "",
                dosage: vaccine?.dosage || "",
                brand: vaccine?.brand?._id || "",
                stock: bybatch.stock ?? 0,
                expirationDate: bybatch?.expirationDate ? bybatch.expirationDate.split("T")[0] : "",
            });

            setVaccineId(vaccine._id || "");
            setBatchId(bybatch._id || "");
        }
    }, [vaccine, bybatch]);

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
        setIsSubmitting(true);

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
                setIsSubmitting(false);
                onClose();
            }, 1000);
        } else {
            await VaccineAdd(fullPayload);
            setTimeout(() => {
                resetForm();
                setIsSubmitting(false);
                onClose();
            }, 1000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">{vaccine ? "Edit Vaccine" : "Add New Vaccine"}</h2>

                {customError && <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">{customError}</div>}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vaccine Name</label>
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
                        <label className="block text-sm font-medium text-gray-700">Description</label>
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
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
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
                            disabled={isSubmitting}
                            className={
                                "rounded-lg bg-blue-600 px-5 py-2 font-medium text-gray-200 hover:bg-blue-500"
                            }
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg
                                        className="h-4 w-4 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        ></path>
                                    </svg>
                                    Saving...
                                </div>
                            ) : vaccine ? (
                                "Update Vaccine Info"
                            ) : (
                                "Add Vaccine"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddVacine;