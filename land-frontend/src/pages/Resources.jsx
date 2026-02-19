// src/pages/Resources.jsx
import { Download, FileText } from "lucide-react";

const RESOURCES = [
  {
    title: "Land Sale Agreement Form",
    description: "Download, fill, sign and upload during land transfer.",
    file: "/resources/sale-agreement.pdf",
  },
  {
    title: "Gift Deed Form",
    description: "Official gift declaration form.",
    file: "/resources/gift-deed.pdf",
  },
  {
    title: "Transfer Instructions Guide",
    description: "Step-by-step guide on how to complete a land transfer.",
    file: "/resources/transfer-guide.pdf",
  },
];

export default function Resources() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-[#4e342e]">Resources</h1>
      <p className="text-gray-700">
        Download official forms, fill them and upload during your application.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {RESOURCES.map((r) => (
          <div key={r.file} className="border rounded-xl p-5 bg-white shadow-sm">
            <FileText className="w-10 h-10 text-[#4e342e]" />
            <h3 className="font-semibold mt-3">{r.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{r.description}</p>

            <a
              href={r.file}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
