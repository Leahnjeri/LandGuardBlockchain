import { useState } from "react";

export default function SearchApplicationForm({ onComplete }) {
  const [form, setForm] = useState({
    full_name: "",
    national_id: "",
    phone: "",
    email: "",
    purpose: "",
    declaration: false,
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitForm = () => {
    const { full_name, national_id, phone, email, purpose, declaration } = form;

    if (!full_name || !national_id || !phone || !email || !purpose) {
      alert("Please complete all fields.");
      return;
    }

    if (!declaration) {
      alert("You must accept the legal declaration.");
      return;
    }

    onComplete(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-xl p-6 space-y-4">

        <h3 className="text-xl font-bold text-[#4e342e]">
          Land Search Application Form
        </h3>

        <input
          name="full_name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="national_id"
          placeholder="National ID / Passport"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <textarea
          name="purpose"
          placeholder="Purpose of the land search"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            name="declaration"
            onChange={handleChange}
          />
          I declare that the information provided is true and I understand
          misuse of land information is a criminal offence.
        </label>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 border rounded bg-[#4e342e] text-white"
            onClick={() => onComplete(null)}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-[#4e342e] text-white rounded"
            onClick={submitForm}
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
}
