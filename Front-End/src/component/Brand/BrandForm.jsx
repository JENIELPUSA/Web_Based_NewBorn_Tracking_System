import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import { BrandDisplayContext } from "../../contexts/BrandContext/BrandContext";

function AddBrandModal({ isOpen, onClose, BrandData }) {
    const { AddBrand, UpdateBrand, customError } = useContext(BrandDisplayContext);
    const { userId } = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [brandName, setBrandName] = useState("");

    useEffect(() => {
        if (isOpen && BrandData) {
            setBrandName(BrandData.name || "");
        } else if (!isOpen) {
            setBrandName("");
        }
    }, [isOpen, BrandData]);

    const handleChange = (e) => {
        setBrandName(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (BrandData) {
            const updatedBrandData = {
                name: brandName,
            };
            await UpdateBrand(BrandData._id, updatedBrandData);
        } else {
            const newBrandData = {
                name: brandName,
            };
            await AddBrand(newBrandData, userId);
        }

        setTimeout(() => {
            setBrandName("");
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    const modalTitle = BrandData ? "Edit Brand" : "Add New Brand";
    const buttonText = BrandData ? "Update Brand" : "Add Brand";
    const submittingButtonText = BrandData ? "Updating..." : "Adding...";

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">{modalTitle}</h2>

                {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">
                        {customError}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-1 block text-sm text-gray-600">Brand Name</label>
                        <input
                            type="text"
                            name="brandName"
                            value={brandName}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || brandName.trim() === ""}
                            className={
                                `rounded-lg px-5 py-2 font-medium text-white ${
                                    isSubmitting || brandName.trim() === ""
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#7B8D6A]  hover:bg-[#7B8D6A]/60 "
                                }`
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
                                    {submittingButtonText}
                                </div>
                            ) : (
                                buttonText
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddBrandModal;