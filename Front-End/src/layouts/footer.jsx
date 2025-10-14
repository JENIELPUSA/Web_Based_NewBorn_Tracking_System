export const Footer = () => {
  return (
    <footer className="relative w-full border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-4 px-6">
      {/* 🔹 Blue line sa itaas */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#93A87E] rounded-t"></div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-1">
        <p className="text-sm text-slate-600 dark:text-slate-300 text-center sm:text-left">
          © 2025 <span className="font-semibold text-[#93A87E] dark:text-blue-400">NeoCare System</span>. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
