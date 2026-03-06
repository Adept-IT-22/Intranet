import React, { useEffect, useState } from "react";
import api from "../../api"; // ✅ axios instance with JWT token

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("HR");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    console.log("📥 Fetching docs from:", api.defaults.baseURL + "documents/");
    try {
      const res = await api.get("documents/"); // ✅ GET list
      console.log("✅ Documents fetched:", res.data);
      setDocuments(res.data);
      setFilteredDocs(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err.response?.data || err);
      if (err.response?.status === 401) {
        alert("⚠️ Session expired! Please log in again.");
      }
    }
  };

  useEffect(() => {
    const filtered = documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocs(filtered);
  }, [searchTerm, documents]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("file", file);

    console.log("📤 Uploading to:", api.defaults.baseURL + "documents/");

    try {
      await api.post("documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Document uploaded!");
      setTitle("");
      setDescription("");
      setFile(null);
      fetchDocuments(); // refresh list
    } catch (err) {
      console.error("❌ Upload failed:", err.response?.data || err);
      alert(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Upload failed. Check backend upload endpoint!"
      );
    }
  };

  const token = localStorage.getItem("access_token");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📂 Documents Library</h1>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search documents..."
        className="border p-2 w-full mb-4 rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* ✅ Upload section */}
      {token ? (
        <div className="border p-4 rounded mb-6 bg-gray-50">
          <h2 className="font-semibold mb-2">Upload a Document</h2>
          <form onSubmit={handleUpload}>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="border p-2 w-full mb-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="HR">HR Forms</option>
              <option value="POLICY">Policies & Procedures</option>
              <option value="PROJECT">Project Files</option>
              <option value="TRAINING">Training Materials</option>
              <option value="ARCHIVE">Archived Documents</option>
            </select>
            <textarea
              className="border p-2 w-full mb-2"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              className="mb-2"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Upload
            </button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          🔒 Log in to upload documents.
        </p>
      )}

      {/* ✅ Document list */}
      <h2 className="font-semibold mb-2">
        Available Documents ({filteredDocs.length})
      </h2>
      <ul className="divide-y">
        {filteredDocs.map((doc) => (
          <li
            key={doc.id}
            className="flex justify-between items-center py-3 hover:bg-gray-100 p-2 rounded"
          >
            <div>
              <p className="font-semibold">{doc.title}</p>
              <p className="text-sm text-gray-600">
                {doc.category} • Uploaded by {doc.uploaded_by_name} on{" "}
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </p>
              {doc.description && (
                <p className="text-xs text-gray-500">{doc.description}</p>
              )}
            </div>
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
