import React from "react";

const Profile = () => {
  const user = {
    image: "https://via.placeholder.com/150",
    fullName: "Juan Dela Cruz",
    email: "juan.delacruz@example.com",
    address: "123 Main Street, Manila, Philippines",
    phone: "+63 912 345 6789",
    role: "Admin",
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md mt-10">
      <div className="flex flex-col items-center">
        <img
          src={user.image}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-red-500"
        />
        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
          {user.fullName}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">{user.role}</p>
      </div>
      <div className="mt-6 space-y-3 text-slate-700 dark:text-slate-300">
        <div>
          <p className="text-sm font-semibold">Email</p>
          <p>{user.email}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Address</p>
          <p>{user.address}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Phone</p>
          <p>{user.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
