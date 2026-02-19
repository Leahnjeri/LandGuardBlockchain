// TransferOwnership.jsx
import { useEffect, useMemo, useState } from "react";
import { FileUp, Mail, ChevronDown, Loader2, CheckCircle, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const OWNER_TRANSFER_TYPES = [
  { value: "sale", label: "Sale (Purchase)" },
  { value: "gift", label: "Gift" },
];

const ADVOCATE_TRANSFER_TYPES = [
  { value: "inheritance", label: "Inheritance / Succession" },
  { value: "court_order", label: "Court Order" },
];

const TRANSFER_TO = [
  { value: "individual", label: "Individual" },
  { value: "organization", label: "Organization" },
];

const BLOCKING_STATUSES = new Set(["DISPUTED", "CAUTION", "CHARGED", "COURT_RESTRICTED"]);

/**
 * ✅ Updated docs:
 * - Inheritance: distribution_schedule (only truly required by backend when PARTIAL)
 * - Court order: unchanged, plus beneficiary IDs
 */
const DOCS_BY_TYPE = {
  sale: [
    { key: "sale_agreement", label: "Sale Agreement", required: true },
    { key: "proof_of_payment", label: "Proof of Payment / Bank Slip", required: true },
    { key: "consent_forms", label: "Consent Forms (if applicable)", required: false },
    { key: "rates_certificate", label: "Rates / Rent Clearance (if applicable)", required: false },
    { key: "other_docs", label: "Other Supporting Documents", required: false },
  ],
  gift: [
    { key: "gift_deed", label: "Gift Deed / Declaration", required: true },
    { key: "consent_forms", label: "Consent Forms (if applicable)", required: false },
    { key: "rates_certificate", label: "Rates / Rent Clearance (if applicable)", required: false },
    { key: "other_docs", label: "Other Supporting Documents", required: false },
  ],
  inheritance: [
    { key: "beneficiary_id_front", label: "Beneficiary Front ID", required: true },
    { key: "beneficiary_id_back", label: "Beneficiary Back ID", required: true },
    { key: "death_certificate", label: "Death Certificate", required: true },
    { key: "grant", label: "Grant of Probate / Letters of Administration", required: true },

    // ✅ New name (clearer). Backend will require ONLY if transfer scope is PARTIAL.
    { key: "distribution_schedule", label: "Distribution Schedule / Allocation Pages (Required if PARTIAL)", required: false },

    { key: "rates_certificate", label: "Rates / Rent Clearance (if applicable)", required: false },
    { key: "other_docs", label: "Other Supporting Documents", required: false },
  ],
  court_order: [
    { key: "beneficiary_id_front", label: "Beneficiary Front ID", required: true },
    { key: "beneficiary_id_back", label: "Beneficiary Back ID", required: true },
    { key: "court_order", label: "Court Order Document", required: true },
    { key: "advocate_practicing_certificate", label: "Advocate Practicing Certificate", required: true },
    { key: "rates_certificate", label: "Rates / Rent Clearance (if applicable)", required: false },
    { key: "other_docs", label: "Other Supporting Documents", required: false },
  ],
};

// simple JWT payload decode (UI gating only)
function getRoleFromToken(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const data = JSON.parse(json);
    return data.role || data.user_role || data.type || null;
  } catch {
    return null;
  }
}

function StatusBadge({ status }) {
  const map = {
    PENDING_NEW_OWNER_CONFIRMATION: "bg-amber-100 text-amber-800",
    PENDING_ADMIN_APPROVAL: "bg-blue-100 text-blue-800",
    NEEDS_CORRECTION: "bg-red-100 text-red-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-zinc-200 text-zinc-800",
  };
  const cls = map[status] || "bg-zinc-200 text-zinc-800";
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{status}</span>;
}

const STEPS = [
  { id: 1, label: "Land" },
  { id: 2, label: "Pre-check + Scope" },
  { id: 3, label: "Parties" },
  { id: 4, label: "Sale Details" }, // sale only
  { id: 5, label: "Documents" },
  { id: 6, label: "Review & Submit" },
];

export default function TransferOwnership() {
  const token = localStorage.getItem("token");
  const role = useMemo(() => localStorage.getItem("role") || getRoleFromToken(token), [token]);

  const isOwner = String(role || "").toUpperCase() === "USER" || String(role || "").toUpperCase() === "OWNER";
  const isAdvocate = String(role || "").toUpperCase() === "ADVOCATE";

  const [myLands, setMyLands] = useState([]);
  const [selectedLandId, setSelectedLandId] = useState("");
  const [titleNumber, setTitleNumber] = useState("");
  const [landLookup, setLandLookup] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const selectedLand = useMemo(() => {
    if (isOwner) return myLands.find((l) => String(l.id) === String(selectedLandId)) || null;
    return landLookup;
  }, [isOwner, myLands, selectedLandId, landLookup]);

  const allowedTypes = useMemo(() => (isAdvocate ? ADVOCATE_TRANSFER_TYPES : OWNER_TRANSFER_TYPES), [isAdvocate]);
  const [transferType, setTransferType] = useState(isAdvocate ? "inheritance" : "sale");

  useEffect(() => {
    if (isAdvocate) setTransferType("inheritance");
    else setTransferType("sale");
  }, [isAdvocate]);

  const activeDocs = useMemo(() => DOCS_BY_TYPE[transferType] || [], [transferType]);

  const [transferTo, setTransferTo] = useState("individual");

  // ✅ New truth fields
  const [newOwnerNationalId, setNewOwnerNationalId] = useState("");
  const [orgRegistrationNo, setOrgRegistrationNo] = useState("");

  // Advocate-only
  const [advocateLicenseNo, setAdvocateLicenseNo] = useState("");

  // Parties (contact details initiator provides)
  const [party, setParty] = useState({
    full_name: "",
    phone: "",
    organization_name: "",
    organization_reg_no: "",
  });

  const [witness, setWitness] = useState({
    name: "",
    phone: "",
    id_number: "",
  });

  const [saleDetails, setSaleDetails] = useState({
    purchase_price_kes: "",
    transfer_date: "",
    payment_reference: "",
    notes: "",
  });

  // ✅ Partial transfer scope
  const [scope, setScope] = useState({
    mode: "FULL", // FULL | PARTIAL
    portion_acres: "",
    portion_percent: "",
    notes: "",
  });

  const [signature, setSignature] = useState({ agreed: false, full_name: "" });

  const [files, setFiles] = useState({});
  useEffect(() => setFiles({}), [transferType]);

  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    const fetchLands = async () => {
      if (!token || !isOwner) return;
      try {
        const res = await fetch(`${API_BASE}/transfer/my-lands`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch lands");
        const data = await res.json();
        setMyLands(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setMyLands([]);
      }
    };
    fetchLands();
  }, [token, isOwner]);

  const landBlockedReason = useMemo(() => {
    if (!selectedLand) return "";
    const st = selectedLand.land_status || "ACTIVE";
    if (BLOCKING_STATUSES.has(st)) return `Transfer blocked because land status is ${st}.`;
    return "";
  }, [selectedLand]);

  const canInitiate = isOwner || isAdvocate;
  const isSale = transferType === "sale";

  const getNextStep = (current) => {
    if (current === 3 && !isSale) return 5; // Parties -> Documents
    return Math.min(current + 1, 6);
  };
  const getPrevStep = (current) => {
    if (current === 5 && !isSale) return 3; // Documents -> Parties
    return Math.max(current - 1, 1);
  };

  const handleFileUpload = (key, file) => setFiles((p) => ({ ...p, [key]: file }));
  const handleDrop = (key, e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileUpload(key, f);
  };

  const missingDocs = () => {
    const m = [];
    for (const d of activeDocs) if (d.required && !files[d.key]) m.push(d.label);

    // ✅ Extra rule: if PARTIAL inheritance -> distribution_schedule must exist
    if (transferType === "inheritance" && String(scope.mode).toUpperCase() === "PARTIAL") {
      if (!files["distribution_schedule"]) m.push("Distribution Schedule / Allocation Pages (Required if PARTIAL)");
    }

    return m;
  };

  const validateScope = () => {
    if (String(scope.mode).toUpperCase() === "FULL") return "";
    if (!selectedLand) return "No land selected for scope validation.";

    const landSize = Number(selectedLand.size || 0);
    const acres = scope.portion_acres ? Number(scope.portion_acres) : null;
    const pct = scope.portion_percent ? Number(scope.portion_percent) : null;

    if (!acres && !pct) return "For partial transfer, provide portion acres or portion percent.";

    if (acres) {
      if (Number.isNaN(acres) || acres <= 0) return "portion acres must be a positive number.";
      if (acres > landSize) return `portion acres cannot exceed land size (${landSize} acres).`;
    }

    if (pct) {
      if (Number.isNaN(pct) || pct <= 0 || pct > 100) return "portion percent must be between 0 and 100.";
    }

    return "";
  };

  const validateStep = (s) => {
    if (!canInitiate) return "Only Owners and Advocates can initiate transfers. Please log in with the correct account.";

    if (s === 1) {
      if (isOwner) {
        if (!selectedLandId) return "Select land from your lands.";
      } else {
        if (!titleNumber.trim()) return "Enter title number.";
        if (!selectedLand) return "Lookup the title number first.";
      }
      if (!transferType) return "Select transfer type.";
      return "";
    }

    if (s === 2) {
      if (!selectedLand) return "No land selected.";
      if (landBlockedReason) return landBlockedReason + " Resolve restriction before applying.";
      const scopeErr = validateScope();
      if (scopeErr) return scopeErr;
      return "";
    }

    if (s === 3) {
      // ✅ New truth-based identity
      if (transferTo === "individual") {
        if (!newOwnerNationalId.trim()) return "Enter new owner's National ID (this is the truth identity).";
      } else {
        if (!orgRegistrationNo.trim()) return "Enter organization registration number (truth identity).";
      }

      if (transferType === "court_order") {
        if (!advocateLicenseNo.trim()) return "Advocate license number is required for court order.";
      }

      // New owner contact info (initiator-provided)
      if (!party.full_name.trim()) return "New owner contact full name is required.";
      if (!party.phone.trim()) return "New owner contact phone is required.";

      if (transferTo === "organization") {
        // optional but nice for UI
        if (!party.organization_name.trim()) return "Organization name is required.";
      }

      // Witness required
      if (!witness.name.trim()) return "Witness name is required.";
      if (!witness.phone.trim()) return "Witness phone is required.";
      if (!witness.id_number.trim()) return "Witness ID/Passport number is required.";

      return "";
    }

    if (s === 4) {
      if (!isSale) return "";
      if (!saleDetails.purchase_price_kes) return "Purchase price (KES) is required for a sale.";
      if (!saleDetails.transfer_date) return "Transfer date is required.";
      return "";
    }

    if (s === 5) {
      const m = missingDocs();
      if (m.length) return `Missing required documents: ${m.join(", ")}`;
      return "";
    }

    if (s === 6) {
      if (!signature.agreed) return "You must accept the declaration to sign digitally.";
      if (!signature.full_name.trim()) return "Enter your full name for digital signature.";
      return "";
    }

    return "";
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) return setMessage(err);
    setMessage("");
    setStep((p) => getNextStep(p));
  };

  const goBack = () => {
    setMessage("");
    setStep((p) => getPrevStep(p));
  };

  const lookupLandByTitle = async () => {
    if (!titleNumber.trim()) return setMessage("Enter a title number first.");
    setLookupLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/lands/by-title/${encodeURIComponent(titleNumber.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setLandLookup(null);
        setMessage(data.detail || "Failed to lookup land by title number.");
        return;
      }
      setLandLookup(data);
    } catch (e) {
      console.error(e);
      setLandLookup(null);
      setMessage("Server error during land lookup.");
    } finally {
      setLookupLoading(false);
    }
  };

  const UploadBox = ({ label, fileKey, required }) => (
    <div className="space-y-2 w-full" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(fileKey, e)}>
      <p className="font-semibold text-[#4e342e]">
        {label} {required && <span className="text-red-600">*</span>}
      </p>

      <div
        className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50 transition"
        onClick={() => document.getElementById(fileKey).click()}
      >
        {!files[fileKey] ? (
          <>
            <FileUp className="mx-auto mb-2 w-10 h-10 text-gray-600" />
            <p className="text-gray-600 text-sm">Click or drag file here</p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-500 animate-bounce" />
            <span className="text-sm">{files[fileKey].name}</span>
          </div>
        )}
      </div>

      <input
        id={fileKey}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(fileKey, e.target.files?.[0] || null)}
      />
    </div>
  );

  const uploadDocuments = async () => {
    const uploaded = {};
    for (const doc of activeDocs) {
      const f = files[doc.key];
      if (!f) continue;

      const fd = new FormData();
      fd.append("file", f);

      const res = await fetch(`${API_BASE}/transfer/upload-doc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error(`Failed to upload: ${doc.label}`);
      const data = await res.json();
      uploaded[doc.key] = data.document_url;
    }

    // ✅ ensure distribution_schedule uploads if present (even if not required)
    if (files["distribution_schedule"] && !uploaded["distribution_schedule"]) {
      const fd = new FormData();
      fd.append("file", files["distribution_schedule"]);
      const res = await fetch(`${API_BASE}/transfer/upload-doc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Failed to upload: Distribution Schedule");
      const data = await res.json();
      uploaded["distribution_schedule"] = data.document_url;
    }

    return uploaded;
  };

  const handleSubmit = async () => {
    const err = validateStep(6);
    if (err) return setMessage(err);

    setLoading(true);
    setMessage("");

    try {
      const uploadedDocs = await uploadDocuments();

      const body = {
        transfer_type: transferType,
        transfer_to: transferTo,

        // ✅ new truth identity fields
        new_owner_national_id: transferTo === "individual" ? newOwnerNationalId.trim() : null,
        org_registration_no: transferTo === "organization" ? orgRegistrationNo.trim() : null,

        transfer_scope: {
          mode: scope.mode,
          portion_acres: scope.portion_acres ? Number(scope.portion_acres) : null,
          portion_percent: scope.portion_percent ? Number(scope.portion_percent) : null,
          notes: scope.notes || "",
        },

        parties: {
          new_owner: {
            full_name: party.full_name,
            phone: party.phone,
            organization_name: transferTo === "organization" ? party.organization_name : "",
            organization_reg_no: transferTo === "organization" ? orgRegistrationNo.trim() : "",
          },
          witness: { ...witness },
          advocate: transferType === "court_order" || isAdvocate ? { license_no: advocateLicenseNo || "" } : null,
        },

        sale_details: isSale ? saleDetails : null,

        documents: uploadedDocs,
        signature: {
          full_name: signature.full_name,
          agreed: signature.agreed,
          signed_at: new Date().toISOString(),
        },
      };

      const landIdForSubmit = selectedLand?.id;
      if (!landIdForSubmit) return setMessage("Missing land id. Please re-check land lookup.");

      const res = await fetch(`${API_BASE}/transfer/initiate/${landIdForSubmit}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) return setMessage(result.detail || "Error initiating transfer.");

      setSubmitted({
        reference_no: result.reference_no,
        status: result.status,
      });

      // reset
      setStep(1);
      setSelectedLandId("");
      setTitleNumber("");
      setLandLookup(null);
      setTransferType(isAdvocate ? "inheritance" : "sale");
      setTransferTo("individual");
      setNewOwnerNationalId("");
      setOrgRegistrationNo("");
      setAdvocateLicenseNo("");
      setParty({ full_name: "", phone: "", organization_name: "", organization_reg_no: "" });
      setWitness({ name: "", phone: "", id_number: "" });
      setSaleDetails({ purchase_price_kes: "", transfer_date: "", payment_reference: "", notes: "" });
      setScope({ mode: "FULL", portion_acres: "", portion_percent: "", notes: "" });
      setFiles({});
      setSignature({ agreed: false, full_name: "" });

      setMessage("Transfer submitted. New owner/org must confirm. Admin has been notified.");
    } catch (e) {
      console.error(e);
      setMessage(e?.message || "Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const StepHeader = () => (
    <div className="flex flex-wrap gap-2">
      {STEPS.map((s) => {
        const isSkipped = s.id === 4 && !isSale;
        const cls =
          s.id === step
            ? "bg-[#4e342e] text-white"
            : s.id < step
            ? "bg-green-100 text-green-800"
            : isSkipped
            ? "bg-zinc-50 text-zinc-400 border border-zinc-200"
            : "bg-zinc-100 text-zinc-700";
        return (
          <div key={s.id} className={`px-3 py-2 rounded-full text-sm ${cls}`}>
            {s.id}. {s.label}
            {isSkipped && " (Skipped)"}
          </div>
        );
      })}
    </div>
  );

  const titleNumberDisabled = isOwner;
  const landSelectDisabled = isAdvocate;

  return (
    <div className="w-full p-4 space-y-6">
      <h1 className="text-4xl font-bold text-[#4e342e]">Transfer Land Ownership</h1>

      {submitted && (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-semibold text-[#4e342e]">Reference No:</p>
            <p className="font-mono">{submitted.reference_no}</p>
            <StatusBadge status={submitted.status} />
          </div>
          <p className="text-sm text-gray-700 mt-2">
            New owner/org must confirm. Admin can already see the application.
          </p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full space-y-6">
        <StepHeader />

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${landSelectDisabled ? "opacity-50" : ""}`}>
                <label className="font-semibold block mb-2 text-[#4e342e]">
                  Select Land (Owner) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <select
                    className="border p-3 rounded-lg w-full appearance-none pr-10"
                    value={selectedLandId}
                    onChange={(e) => setSelectedLandId(e.target.value)}
                    disabled={landSelectDisabled}
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
              </div>

              <div className={`${titleNumberDisabled ? "opacity-50" : ""}`}>
                <label className="font-semibold block mb-2 text-[#4e342e]">
                  Title Number (Advocate) <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="border p-3 rounded-lg w-full"
                    placeholder="e.g. NYERI/ABCD/1234"
                    value={titleNumber}
                    onChange={(e) => setTitleNumber(e.target.value)}
                    disabled={titleNumberDisabled}
                  />
                  <button
                    type="button"
                    onClick={lookupLandByTitle}
                    disabled={titleNumberDisabled || lookupLoading}
                    className="bg-black text-white px-4 rounded-lg flex items-center gap-2 disabled:bg-opacity-30 disabled:cursor-not-allowed"
                  >
                    {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Lookup
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-2 text-[#4e342e]">
                Transfer Type <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <select
                  className="border p-3 rounded-lg w-full appearance-none pr-10"
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value)}
                >
                  {allowedTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {isOwner ? "Owner can initiate Sale/Gift only." : "Advocate can initiate Inheritance/Court Order only."}
              </p>
            </div>

            <button className="w-full py-3 rounded-lg text-lg font-medium bg-black text-white hover:bg-gray-900" onClick={goNext}>
              Next
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5">
            {!selectedLand ? (
              <div className="p-4 rounded-xl bg-red-100 text-red-800 border border-red-200">
                No land selected. Go back and choose a land or lookup a title number.
              </div>
            ) : (
              <div className="border rounded-xl p-4 bg-zinc-50">
                <p className="font-semibold text-[#4e342e] mb-2">Land Card</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="font-medium">Title:</span> {selectedLand.title_number}
                  </p>
                  <p>
                    <span className="font-medium">Size:</span> {selectedLand.size} acres
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {selectedLand.land_status || "ACTIVE"}
                  </p>
                </div>

                {landBlockedReason ? (
                  <div className="mt-3 p-3 rounded-lg bg-red-100 text-red-800">{landBlockedReason}</div>
                ) : (
                  <div className="mt-3 p-3 rounded-lg bg-green-100 text-green-800">Pre-check passed.</div>
                )}
              </div>
            )}

            {/* ✅ Transfer Scope */}
            <div className="border rounded-xl p-4">
              <p className="font-semibold text-[#4e342e] mb-3">Transfer Scope</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-2 text-[#4e342e]">Scope</label>
                  <select
                    className="border p-3 rounded-lg w-full"
                    value={scope.mode}
                    onChange={(e) => setScope((p) => ({ ...p, mode: e.target.value }))}
                  >
                    <option value="FULL">Full Transfer (entire land)</option>
                    <option value="PARTIAL">Partial Transfer (portion)</option>
                  </select>
                </div>

                {String(scope.mode).toUpperCase() === "PARTIAL" && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Enter either <span className="font-semibold">portion acres</span> or <span className="font-semibold">portion percent</span>.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="0"
                        className="border p-3 rounded-lg"
                        placeholder="Portion (acres)"
                        value={scope.portion_acres}
                        onChange={(e) => setScope((p) => ({ ...p, portion_acres: e.target.value }))}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="border p-3 rounded-lg"
                        placeholder="Portion (%)"
                        value={scope.portion_percent}
                        onChange={(e) => setScope((p) => ({ ...p, portion_percent: e.target.value }))}
                      />
                    </div>
                    <textarea
                      className="border p-3 rounded-lg w-full min-h-[80px]"
                      placeholder="Notes (optional) — e.g. ‘transfer 0.25 acres for access road’"
                      value={scope.notes}
                      onChange={(e) => setScope((p) => ({ ...p, notes: e.target.value }))}
                    />
                    {transferType === "inheritance" && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                        For <span className="font-semibold">partial inheritance</span>, upload the{" "}
                        <span className="font-semibold">Distribution Schedule / Allocation Pages</span> in Documents.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg" onClick={goBack}>
                Back
              </button>
              <button className="bg-black text-white py-2 px-4 rounded-lg disabled:bg-opacity-30" onClick={goNext} disabled={!selectedLand || !!landBlockedReason}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-2 text-[#4e342e]">
                  Transfer to <span className="text-red-600">*</span>
                </label>
                <select className="border p-3 rounded-lg w-full" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
                  {TRANSFER_TO.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </div>

              {transferTo === "individual" ? (
                <div>
                  <label className="font-semibold block mb-2 text-[#4e342e]">
                    New Owner National ID (Truth) <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="border p-3 rounded-lg w-full"
                    placeholder="e.g. 12345678"
                    value={newOwnerNationalId}
                    onChange={(e) => setNewOwnerNationalId(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    System will resolve the email/notification from this ID. Email input is not trusted.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-semibold block mb-2 text-[#4e342e]">
                    Organization Registration No (Truth) <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="border p-3 rounded-lg w-full"
                    placeholder="e.g. CPR/2012/12345"
                    value={orgRegistrationNo}
                    onChange={(e) => setOrgRegistrationNo(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    System will resolve the organization account by registration number.
                  </p>
                </div>
              )}

              {transferType === "court_order" && (
                <div className="md:col-span-2">
                  <label className="font-semibold block mb-2 text-[#4e342e]">
                    Advocate License No (LSK) <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="border p-3 rounded-lg w-full"
                    placeholder="e.g. LSK/12345"
                    value={advocateLicenseNo}
                    onChange={(e) => setAdvocateLicenseNo(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="border rounded-xl p-4">
              <p className="font-semibold text-[#4e342e] mb-3">
                {transferTo === "organization" ? "Organization Contact Person" : "New Owner Contact Details"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="border p-3 rounded-lg"
                  placeholder="Full Name *"
                  value={party.full_name}
                  onChange={(e) => setParty((p) => ({ ...p, full_name: e.target.value }))}
                />
                <input
                  className="border p-3 rounded-lg"
                  placeholder="Phone Number *"
                  value={party.phone}
                  onChange={(e) => setParty((p) => ({ ...p, phone: e.target.value }))}
                />

                {transferTo === "organization" && (
                  <input
                    className="border p-3 rounded-lg md:col-span-2"
                    placeholder="Organization Name *"
                    value={party.organization_name}
                    onChange={(e) => setParty((p) => ({ ...p, organization_name: e.target.value }))}
                  />
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                The new owner/org will still confirm and finalize their profile after logging in.
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="font-semibold text-[#4e342e] mb-3">Witness Details (Required)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="border p-3 rounded-lg" placeholder="Witness Full Name *" value={witness.name} onChange={(e) => setWitness((p) => ({ ...p, name: e.target.value }))} />
                <input className="border p-3 rounded-lg" placeholder="Witness Phone *" value={witness.phone} onChange={(e) => setWitness((p) => ({ ...p, phone: e.target.value }))} />
                <input className="border p-3 rounded-lg" placeholder="Witness ID/Passport No. *" value={witness.id_number} onChange={(e) => setWitness((p) => ({ ...p, id_number: e.target.value }))} />
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg" onClick={goBack}>
                Back
              </button>
              <button className="bg-black text-white py-2 px-4 rounded-lg" onClick={goNext}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 (Sale only) */}
        {step === 4 && (
          <div className="space-y-5">
            {!isSale ? (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700">
                Sale details are not required for this transfer type. Click Next.
              </div>
            ) : (
              <div className="border rounded-xl p-4">
                <p className="font-semibold text-[#4e342e] mb-3">Sale Details (Only for Sale)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="0"
                    className="border p-3 rounded-lg"
                    placeholder="Purchase Price (KES) *"
                    value={saleDetails.purchase_price_kes}
                    onChange={(e) => setSaleDetails((p) => ({ ...p, purchase_price_kes: e.target.value }))}
                  />

                  <div className="space-y-1">
                    <input type="date" className="border p-3 rounded-lg w-full" value={saleDetails.transfer_date} onChange={(e) => setSaleDetails((p) => ({ ...p, transfer_date: e.target.value }))} />
                    <p className="text-xs text-gray-600">Transfer date *</p>
                  </div>

                  <input
                    className="border p-3 rounded-lg md:col-span-2"
                    placeholder="Payment Reference (optional)"
                    value={saleDetails.payment_reference}
                    onChange={(e) => setSaleDetails((p) => ({ ...p, payment_reference: e.target.value }))}
                  />

                  <textarea
                    className="border p-3 rounded-lg md:col-span-2 min-h-[110px]"
                    placeholder="Notes (optional)"
                    value={saleDetails.notes}
                    onChange={(e) => setSaleDetails((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3">
              <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg" onClick={goBack}>
                Back
              </button>
              <button className="bg-black text-white py-2 px-4 rounded-lg" onClick={goNext}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="font-semibold text-[#4e342e]">Document Checklist ({transferType.toUpperCase()})</p>
              <p className="text-sm text-gray-700 mt-1">
                Required documents are marked with <span className="text-red-600 font-semibold">*</span>.
              </p>
              {transferType === "inheritance" && String(scope.mode).toUpperCase() === "PARTIAL" && (
                <p className="text-sm text-amber-900 mt-2">
                  Because this is <span className="font-semibold">PARTIAL inheritance</span>, upload{" "}
                  <span className="font-semibold">Distribution Schedule</span>.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDocs.map((d) => (
                <UploadBox key={d.key} label={d.label} fileKey={d.key} required={d.required} />
              ))}
            </div>

            <div className="flex justify-between gap-3">
              <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg" onClick={goBack}>
                Back
              </button>
              <button className="bg-black text-white py-2 px-4 rounded-lg" onClick={goNext}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="border rounded-xl p-4 bg-zinc-50">
              <p className="font-semibold text-[#4e342e] mb-3">Review Summary</p>

              <div className="text-sm space-y-2">
                <p>
                  <span className="font-medium">Land:</span> {selectedLand?.title_number}
                </p>
                <p>
                  <span className="font-medium">Transfer Type:</span> {transferType}
                </p>
                <p>
                  <span className="font-medium">Transfer To:</span> {transferTo}
                </p>

                {transferTo === "individual" ? (
                  <p>
                    <span className="font-medium">New Owner National ID:</span> {newOwnerNationalId}
                  </p>
                ) : (
                  <p>
                    <span className="font-medium">Organization Reg No:</span> {orgRegistrationNo}
                  </p>
                )}

                <p className="mt-3 font-medium">Scope:</p>
                <p>
                  {String(scope.mode).toUpperCase() === "FULL"
                    ? "FULL transfer"
                    : `PARTIAL transfer — Acres: ${scope.portion_acres || "N/A"} | Percent: ${scope.portion_percent || "N/A"}`}
                </p>

                <p className="mt-3 font-medium">New Owner Contact:</p>
                <p>
                  {party.full_name} — {party.phone}
                </p>

                {transferTo === "organization" && (
                  <p>
                    <span className="font-medium">Organization Name:</span> {party.organization_name}
                  </p>
                )}

                <p className="mt-3 font-medium">Witness:</p>
                <p>
                  {witness.name} — {witness.phone} — ID: {witness.id_number}
                </p>

                <p className="mt-3 font-medium">Sale Details:</p>
                {isSale ? (
                  <p>
                    Price (KES): {saleDetails.purchase_price_kes || "N/A"} | Transfer Date: {saleDetails.transfer_date || "N/A"} | Payment Ref:{" "}
                    {saleDetails.payment_reference || "N/A"}
                  </p>
                ) : (
                  <p>Not applicable.</p>
                )}

                <p className="mt-3 font-medium">Documents uploaded:</p>
                <ul className="list-disc pl-5">
                  {Object.keys(files)
                    .filter((k) => files[k])
                    .map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                </ul>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-sm">
                After submit: new owner/org confirms → then admin reviews/approves/rejects.
              </div>
            </div>

            <div className="border rounded-xl p-4">
              <p className="font-semibold text-[#4e342e] mb-2">Initiator Digital Signature</p>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1" checked={signature.agreed} onChange={(e) => setSignature((p) => ({ ...p, agreed: e.target.checked }))} />
                <span>I declare the information submitted is true and correct.</span>
              </label>

              <div className="mt-3">
                <label className="font-semibold block mb-2 text-[#4e342e]">
                  Type Full Name to Sign <span className="text-red-600">*</span>
                </label>
                <input className="border p-3 rounded-lg w-full" placeholder="Your full legal name" value={signature.full_name} onChange={(e) => setSignature((p) => ({ ...p, full_name: e.target.value }))} />
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg" onClick={goBack}>
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#4e342e] text-white py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {message && (
        <p
          className={`p-3 rounded-lg ${
            message.toLowerCase().includes("missing") || message.toLowerCase().includes("blocked") ? "text-red-700 bg-red-100" : "text-green-700 bg-green-100"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
