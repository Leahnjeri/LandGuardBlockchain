import { useEffect, useState } from "react";
import {
  FileUp,
  Mail,
  ChevronDown,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function TransferOwnership() {
  const [myLands, setMyLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [files, setFiles] = useState({
    seller_id: null,
    buyer_id: null,
    sale_agreement: null,
    rates_certificate: null,
    transfer_form: null,
    other_docs: null,
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step wizard

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/lands/my-lands", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMyLands(Array.isArray(data) ? data : []))
      .catch(() => setMyLands([]));
  }, []);

  const handleFileUpload = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleDrop = (key, e) => {
    e.preventDefault();
    handleFileUpload(key, e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedLand || !buyerEmail) {
      return setMessage("Please fill all fields.");
    }

    setLoading(true);
    let uploaded = {};

    for (const key of Object.keys(files)) {
      if (!files[key]) continue;

      const fd = new FormData();
      fd.append("file", files[key]);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8000/transfer/upload-doc", true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((prev) => ({
            ...prev,
            [key]: Math.round((e.loaded / e.total) * 100),
          }));
        }
      };

      const uploadPromise = new Promise((resolve) => {
        xhr.onload = () => {
          const data = JSON.parse(xhr.response);
          uploaded[key] = data.url;
          resolve();
        };
      });

      xhr.send(fd);
      await uploadPromise;
    }

    const res = await fetch(
      `http://localhost:8000/transfer/initiate/${selectedLand}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buyer_email: buyerEmail,
          documents: uploaded,
        }),
      }
    );

    const result = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage("Transfer request submitted successfully!");
      setStep(1);
      setFiles({
        seller_id: null,
        buyer_id: null,
        sale_agreement: null,
        rates_certificate: null,
        transfer_form: null,
        other_docs: null,
      });
      setUploadProgress({});
    } else {
      setMessage(result.detail || "Error during transfer.");
    }
  };

  const UploadBox = ({ label, fileKey }) => (
    <div
      className="space-y-2 w-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(fileKey, e)}
    >
      <p className="font-semibold text-[#4e342e]">{label}</p>

      <div
        className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50 transition relative"
        onClick={() => document.getElementById(fileKey).click()}
      >
        {!files[fileKey] && (
          <>
            <FileUp className="mx-auto mb-2 w-10 h-10 text-gray-600" />
            <p className="text-gray-600 text-sm">Click or drag file here</p>
          </>
        )}

        {files[fileKey] && (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-500 animate-bounce" />
            <span className="text-sm">{files[fileKey].name}</span>
            {uploadProgress[fileKey] !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${uploadProgress[fileKey]}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        id={fileKey}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(fileKey, e.target.files[0])}
      />
    </div>
  );

  return (
    <div className="w-full p-4 space-y-6">

      <h1 className="text-4xl font-bold text-[#4e342e]">
        Transfer Land Ownership
      </h1>

      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full">

        {/* Step Wizard */}
        {step === 1 && (
          <>
            <div>
              <label className="font-semibold block mb-2 text-[#4e342e]">
                Select Land
              </label>
              <div className="relative">
                <select
                  className="border p-3 rounded-lg w-full appearance-none pr-10"
                  value={selectedLand}
                  onChange={(e) => setSelectedLand(e.target.value)}
                >
                  <option value="">-- Select Land --</option>
                  {myLands.map((land) => (
                    <option key={land.id} value={land.id}>
                      {land.title_number} — {land.size} acres
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
              </div>

              <div className="mt-6">
                <label className="font-semibold block mb-2 text-[#4e342e]">Buyer Email</label>
                <div className="relative">
                  <input
                    type="email"
                    className="border p-3 rounded-lg w-full pl-10"
                    placeholder="buyer@example.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedLand || !buyerEmail}
                className={`w-full py-3 rounded-lg text-lg font-medium mt-8 
                  ${selectedLand && buyerEmail
                    ? "bg-black text-white hover:bg-gray-900"
                    : "bg-black bg-opacity-30 text-white cursor-not-allowed"
                  } transition`}
              >
                Next: Upload Documents
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <UploadBox label="ID Copy (Seller)" fileKey="seller_id" />
              <UploadBox label="ID Copy (Buyer)" fileKey="buyer_id" />
              <UploadBox label="Sale Agreement" fileKey="sale_agreement" />
              <UploadBox label="Land Rates Clearance Certificate" fileKey="rates_certificate" />
              <UploadBox label="Transfer Form (L.R. Form)" fileKey="transfer_form" />
              <UploadBox label="Other Supporting Documents" fileKey="other_docs" />
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#4e342e] text-white py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Submit Transfer
              </button>
            </div>
          </>
        )}
      </div>

      {message && (
        <p className="text-green-700 bg-green-100 p-3 rounded-lg">{message}</p>
      )}
    </div>
  );
}
