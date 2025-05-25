import { useState } from "react";
import { Filter } from "lucide-react";

export default function FilterPanel({ children, onApply }) {
  const [open, setOpen] = useState(false);

  function handleApply() {
    if (onApply) onApply();
    setOpen(false);
  }

  return (
    <>
      {/* FILTER BUTTON: always visible */}
      <div className="w-full flex justify-end mb-4">
        <button
          className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold shadow hover:bg-yellow-300"
          onClick={() => setOpen(true)}
        >
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-4 text-3xl text-yellow-400 font-bold hover:text-yellow-300"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-bold text-yellow-300 flex items-center gap-2 mb-4">
              <Filter size={18} /> Filters
            </h2>
            {/* INLINE FILTERS ROW */}
            <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
              {children}
            </div>
            {/* APPLY BUTTON */}
            <div className="flex justify-center mt-6">
              <button
                className="bg-yellow-400 text-gray-900 rounded-lg px-8 py-2 font-semibold hover:bg-yellow-300"
                onClick={handleApply}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
