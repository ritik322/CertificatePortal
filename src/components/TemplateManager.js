"use client";

import { useState, useEffect } from "react";
import Loader from "./Loader";

// The session is now passed as a prop to get the admin's department
export default function TemplateManager({ session }) {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({ name: "", templateId: "" });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchTemplates = async () => {
    try {
      // Fetch only the templates for the logged-in admin's department
      const res = await fetch(`/api/templates?department=${session.user.department}`);
      if (!res.ok) throw new Error("Failed to fetch templates.");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (session) {
        fetchTemplates();
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (template) => {
    setEditingTemplateId(template._id);
    setFormData({ name: template.name, templateId: template.templateId });
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
    setFormData({ name: "", templateId: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const isEditing = !!editingTemplateId;
    const url = "/api/templates";
    const method = isEditing ? "PUT" : "POST";
    // We no longer send the 'departments' field
    const body = isEditing ? JSON.stringify({ id: editingTemplateId, ...formData }) : JSON.stringify(formData);

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setMessage(`Template ${isEditing ? 'updated' : 'added'} successfully!`);
      handleCancelEdit();
      fetchTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium mb-2">Existing Templates</h3>
        <div className="space-y-2 rounded-md border p-2">
          {templates.length ? templates.map((template) => (
            <div key={template._id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
              <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{template.name}</span>
                  <span className="text-xs text-gray-500">{template.templateId}</span>
              </div>
              <div className="flex items-center space-x-2">
                  <button onClick={() => handleEditClick(template)} className="text-indigo-600 hover:underline">Edit</button>
              </div>
            </div>
          )) : <h1 className="text-center text-gray-400">No Templates</h1>}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium mb-2">{editingTemplateId ? "Edit Template" : "Add New Template"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1">Google Doc/Slide ID</label>
              <input id="templateId" name="templateId" value={formData.templateId} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md"/>
            </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end items-center space-x-2">
            {editingTemplateId && (<button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm border rounded-md">Cancel</button>)}
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md">
              {loading ? <Loader text={editingTemplateId ? "Updating..." : "Adding..."} /> : (editingTemplateId ? "Update" : "Add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}