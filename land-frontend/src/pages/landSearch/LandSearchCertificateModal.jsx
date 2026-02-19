// LandSearchCertificateModal.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Shows a certificate-like UI for an APPROVED land search request.
 * Fetches real land + owner data from:
 *   GET http://localhost:8000/lands/by-title/{title_number}
 * Then reverse-geocodes lat/lon to a human location using OSM Nominatim.
 * Masks sensitive owner fields (national_id, phone, email).
 */

function maskNationalId(id) {
  if (!id) return "N/A";
  const s = String(id);
  if (s.length < 5) return "N/A";
  return `${s.slice(0, 3)}****${s.slice(-2)}`;
}

function maskPhone(phone) {
  if (!phone) return "N/A";
  const s = String(phone);
  if (s.length < 6) return "N/A";
  return `${s.slice(0, 4)}****${s.slice(-2)}`;
}

function maskEmail(email) {
  if (!email || !String(email).includes("@")) return "N/A";
  const [name, domain] = String(email).split("@");
  if (!domain) return "N/A";
  if (name.length <= 2) return `**@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

async function reverseGeocode(lat, lon) {
  try {
    // Nominatim requires a User-Agent on some setups; browsers set one automatically.
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}`
    );
    const data = await res.json();
    return data?.display_name || "Unknown location";
  } catch (err) {
    console.error("Geocoding failed:", err);
    return "Unknown location";
  }
}

function printCertificateHTML(cert) {
  const html = `
  <html>
    <head>
      <title>Land Search Certificate - ${cert.titleNumber}</title>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f3f4f6; }
        .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 18mm; border: 1px solid #ddd; }
        .border { border: 3px solid #3b2a24; padding: 14mm; position: relative; }
        .watermark {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-size: 64px; font-weight: 800; color: rgba(0,0,0,0.05); transform: rotate(-20deg);
          letter-spacing: 6px; user-select: none; pointer-events: none;
        }
        .header { display:flex; gap: 12px; align-items:center; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .logo {
          width: 64px; height: 64px; border: 2px solid #3b2a24; border-radius: 50%;
          display:flex; align-items:center; justify-content:center; font-weight:700; color:#3b2a24;
        }
        .hgroup { flex: 1; text-align: center; }
        .h1 { margin: 0; font-size: 16px; font-weight: 700; text-transform: uppercase; }
        .h2 { margin: 4px 0 0; font-size: 12px; color: #444; }
        .meta { display:flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color:#333; }
        .title { margin: 14px 0 10px; text-align:center; font-size: 20px; font-weight: 800; letter-spacing: 1px; }
        .sub { text-align:center; font-size: 12px; color:#555; margin-bottom: 14px; }
        .section { margin-top: 14px; }
        .label { font-size: 11px; color:#555; text-transform: uppercase; letter-spacing: .6px; }
        .box { border: 1px solid #ddd; border-radius: 10px; padding: 12px; background: #fff; }
        .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
        .row { display:flex; justify-content: space-between; gap: 12px; }
        .k { font-weight: 700; color:#3b2a24; }
        .v { color:#111; text-align:right; word-break: break-word; }
        .statement { margin-top: 14px; line-height: 1.5; font-size: 12.5px; color:#222; }
        .footer { display:flex; justify-content: space-between; gap: 18px; margin-top: 20px; align-items:flex-end; }
        .sign { flex: 1; }
        .line { margin-top: 40px; border-top: 1px solid #333; }
        .small { font-size: 11px; color:#444; margin-top: 6px; }
        .seal {
          width: 110px; height: 110px; border: 2px dashed #3b2a24; border-radius: 50%;
          display:flex; align-items:center; justify-content:center; text-align:center;
          font-weight: 800; color:#3b2a24; font-size: 12px; padding: 10px;
        }
        .note { margin-top: 14px; font-size: 11px; color:#555; border-top: 1px solid #eee; padding-top: 10px; }
        @media print {
          body { background: white; padding: 0; }
          .page { border: none; padding: 0; width: auto; min-height: auto; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="border">
          <div class="watermark">LAND REGISTRY</div>

          <div class="header">
            <div class="logo">LOGO</div>
            <div class="hgroup">
              <p class="h1">Ministry of Lands, Housing & Urban Development</p>
              <p class="h2">${cert.registryOffice}</p>
            </div>
            <div style="width:64px;"></div>
          </div>

          <div class="meta">
            <div><span class="k">Certificate No:</span> ${cert.certNo}</div>
            <div><span class="k">Issue Date:</span> ${cert.issuedAt}</div>
          </div>

          <div class="title">LAND SEARCH CERTIFICATE</div>
          <div class="sub">Issued upon request for official search of registry records</div>

          <div class="section">
            <div class="label">Search Details</div>
            <div class="box">
              <div class="grid">
                <div class="row"><span class="k">Title Number</span><span class="v">${cert.titleNumber}</span></div>
                <div class="row"><span class="k">Land Size</span><span class="v">${cert.landSize}</span></div>
                <div class="row"><span class="k">Location</span><span class="v">${cert.location}</span></div>
                <div class="row"><span class="k">Owner</span><span class="v">${cert.ownerName}</span></div>
                <div class="row"><span class="k">National ID</span><span class="v">${cert.ownerNationalId}</span></div>
                <div class="row"><span class="k">Phone</span><span class="v">${cert.ownerPhone}</span></div>
                <div class="row"><span class="k">Email</span><span class="v">${cert.ownerEmail}</span></div>
              </div>

              <div class="statement">
                <strong>Official Statement:</strong> This is to certify that an official search has been conducted
                against the registry records for the above Title Number and the particulars shown herein reflect the
                position of the register as at the date of issue.
              </div>
            </div>
          </div>

          <div class="note">${cert.remarks}</div>

          <div class="footer">
            <div class="sign">
              <div class="line"></div>
              <div class="small"><strong>${cert.officerName}</strong></div>
              <div class="small">${cert.officerTitle}</div>
            </div>

            <div class="seal">OFFICIAL<br/>SEAL</div>

            <div class="sign">
              <div class="line"></div>
              <div class="small"><strong>Applicant Signature</strong> (Optional)</div>
              <div class="small">________________________</div>
            </div>
          </div>

        </div>
      </div>

      <script>
        window.onload = () => window.print();
      </script>
    </body>
  </html>
  `;

  const w = window.open("", "_blank", "width=900,height=1200");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export default function LandSearchCertificateModal({ open, onClose, request }) {
  const token = localStorage.getItem("token");

  const [land, setLand] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState(null);

  // Fetch land + owner info when modal opens
  useEffect(() => {
    const load = async () => {
      if (!open || !request?.title_number) return;

      setLoading(true);
      setErrMsg(null);
      setLand(null);
      setLocationName("");

      try {
        // IMPORTANT: title numbers contain "/" so encode it
        const url = `http://localhost:8000/lands/by-title/${encodeURIComponent(
          request.title_number
        )}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.detail || "Failed to fetch land details");
        }

        const data = await res.json();
        setLand(data);

        // Reverse geocode only if we have coordinates
        if (data?.latitude != null && data?.longitude != null) {
          const loc = await reverseGeocode(data.latitude, data.longitude);
          setLocationName(loc);
        } else {
          setLocationName("Unknown location");
        }
      } catch (e) {
        console.error(e);
        setErrMsg(e.message || "Failed to load certificate data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, request?.title_number, token]);

  const cert = useMemo(() => {
    const issuedAt = new Date().toLocaleDateString();
    const certNo = `LSC-${String(request?.id ?? 0).padStart(6, "0")}`;

    const owner = land?.owner || {};

    return {
      certNo,
      issuedAt,
      registryOffice: "Nairobi Land Registry",
      titleNumber: land?.title_number || request?.title_number || "N/A",
      landSize:
        land?.size != null && land?.size !== ""
          ? `${land.size} Acres`
          : "N/A",
      location: locationName || (loading ? "Resolving location..." : "N/A"),
      ownerName: owner?.full_name || "N/A",
      ownerNationalId: maskNationalId(owner?.national_id),
      ownerPhone: maskPhone(owner?.phone_number),
      ownerEmail: maskEmail(owner?.email),

      remarks:
        "Personal identifiers are partially masked in compliance with data protection requirements.",
      officerName: "Land Registrar",
      officerTitle: "Registry Officer",
    };
  }, [land, request, locationName, loading]);

  if (!open || !request) return null;

  const downloadTxt = () => {
    const txt = `LAND SEARCH CERTIFICATE
Certificate No: ${cert.certNo}
Issue Date: ${cert.issuedAt}
Registry: ${cert.registryOffice}

Title Number: ${cert.titleNumber}
Land Size: ${cert.landSize}
Location: ${cert.location}

Registered Owner: ${cert.ownerName}
National ID: ${cert.ownerNationalId}
Phone: ${cert.ownerPhone}
Email: ${cert.ownerEmail}

Remarks: ${cert.remarks}
Officer: ${cert.officerName} - ${cert.officerTitle}
`;
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LandSearchCertificate_${cert.titleNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-[#e0d7d0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f3eee9] border-b border-[#e0d7d0]">
          <div>
            <h4 className="text-lg font-bold text-[#4e342e]">
              Land Search Certificate
            </h4>
            <p className="text-sm text-gray-600">
              Title:{" "}
              <span className="font-medium text-[#4e342e]">
                {cert.titleNumber}
              </span>{" "}
              • Cert No: <span className="font-medium">{cert.certNo}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-white border border-[#e0d7d0] text-[#4e342e] hover:bg-[#faf7f5]"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 bg-gray-100 max-h-[80vh] overflow-y-auto overflow-x-hidden">
          {errMsg && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
              {errMsg}
            </div>
          )}

          {loading && (
            <div className="mb-4 text-sm text-gray-700">Loading certificate…</div>
          )}

          <div className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow border border-[#e0d7d0] p-4 md:p-8 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="text-6xl font-extrabold text-black/5 rotate-[-20deg] tracking-[0.3em]">
                LAND REGISTRY
              </div>
            </div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full border-2 border-[#4e342e] flex items-center justify-center font-bold text-[#4e342e]">
                  LOGO
                </div>
                <div className="flex-1 text-center">
                  <div className="text-sm font-bold uppercase text-[#4e342e]">
                    Ministry of Lands, Housing & Urban Development
                  </div>
                  <div className="text-xs text-gray-600">{cert.registryOffice}</div>
                </div>
                <div className="w-16" />
              </div>

              <div className="flex justify-between text-xs text-gray-700 mt-3">
                <div>
                  <span className="font-semibold text-[#4e342e]">
                    Certificate No:
                  </span>{" "}
                  {cert.certNo}
                </div>
                <div>
                  <span className="font-semibold text-[#4e342e]">Issue Date:</span>{" "}
                  {cert.issuedAt}
                </div>
              </div>

              <h2 className="text-center text-2xl font-extrabold text-[#4e342e] mt-5 tracking-wide">
                LAND SEARCH CERTIFICATE
              </h2>
              <p className="text-center text-xs text-gray-600 mt-1">
                Issued upon request for official search of registry records
              </p>

              <div className="mt-6 bg-[#faf7f5] border border-[#e0d7d0] rounded-xl p-4">
                <div className="text-[11px] uppercase tracking-wider text-gray-600">
                  Certificate Details
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {[
                    ["Title Number", cert.titleNumber],
                    ["Land Size", cert.landSize],
                    ["Location", cert.location],
                    ["Registered Owner", cert.ownerName],
                    ["National ID", cert.ownerNationalId],
                    ["Phone", cert.ownerPhone],
                    ["Email", cert.ownerEmail],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <span className="font-semibold text-[#4e342e]">{k}</span>
                      <span className="text-right text-gray-800 break-words min-w-0">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-sm text-gray-800 leading-relaxed">
                  <span className="font-semibold text-[#4e342e]">
                    Official Statement:
                  </span>{" "}
                  This is to certify that an official search has been conducted against the
                  registry records for the above Title Number and the particulars shown herein
                  reflect the position of the register as at the date of issue.
                </p>

                <p className="mt-3 text-xs text-gray-600 border-t pt-3">
                  {cert.remarks}
                </p>
              </div>

              <div className="mt-6 flex items-end justify-between gap-6">
                <div className="flex-1">
                  <div className="border-t border-gray-700 pt-2 text-xs text-gray-700">
                    <div className="font-semibold">{cert.officerName}</div>
                    <div>{cert.officerTitle}</div>
                  </div>
                </div>

                <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#4e342e] flex items-center justify-center text-center text-xs font-extrabold text-[#4e342e]">
                  OFFICIAL
                  <br />
                  SEAL
                </div>

                <div className="flex-1">
                  <div className="border-t border-gray-700 pt-2 text-xs text-gray-700 text-right">
                    <div className="font-semibold">Applicant Signature</div>
                    <div>(Optional)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              onClick={() => printCertificateHTML(cert)}
              className="bg-[#4e342e] text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-95"
            >
              Download / Print (Save as PDF)
            </button>

            <button
              onClick={downloadTxt}
              className="bg-white border border-[#4e342e] text-[#4e342e] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#faf7f5]"
            >
              Download TXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
