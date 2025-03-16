import React, { useState, useRef, useCallback } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null);
    } else if (file) {
      alert("Please select a valid image file!");
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const openFileSelector = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const clearFile = () => {
    setImage(null);
    setPreview(null);
    setAnalysis(null);
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image first!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    
    // Add prompt if provided
    if (prompt) {
      formData.append("prompt", prompt);
    }

    try {
      const res = await axios.post("https://gcp-project-1092394872023.us-central1.run.app", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(res.data);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error analyzing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a descriptive analysis text
  const getDescriptiveAnalysis = () => {
    if (!analysis) return "";
    
    let description = "";
    
    if (analysis.category === "Human") {
      description = `The image depicts a person. ${analysis.faceDetails}`;
    } else if (analysis.category === "Animal" || analysis.category.toLowerCase() in ["cow", "dog", "cat", "horse", "bird"]) {
      const animalType = analysis.category === "Animal" 
        ? "animal" 
        : analysis.category.toLowerCase();
      
      // Extract relevant labels
      const features = analysis.labels
        .filter(label => !label.toLowerCase().includes(animalType))
        .slice(0, 3)
        .join(", ");
      
      description = `The image depicts a ${animalType}, specifically showing its ${features}. It appears to be a well-defined specimen with notable characteristics. If you have any specific questions about ${animalType}s, feel free to ask!`;
    } else {
      description = analysis.detectedEntity;
    }
    
    return description;
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      {/* Compact Header */}
      <header className="bg-yellow-50 border-b border-yellow-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h1 className="text-xl font-bold text-green-900">Magic Path</h1>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h2 className="text-xl font-bold text-green-900">Output</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Panel */}
            <div className="bg-pink-50 rounded-lg border border-pink-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Upload an Image</h2>
              
              {/* File Input */}
              <div className="bg-white border border-pink-200 rounded-lg mb-4">
                <input
                  type="text"
                  value={image ? image.name : ""}
                  readOnly
                  placeholder="Choose an image file..."
                  className="w-full p-3 rounded-lg outline-none"
                />
              </div>
              
              {/* Preview */}
              {preview && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">
                      PREVIEW - {image ? image.name.toUpperCase() : ""}
                    </div>
                    <button 
                      onClick={clearFile}
                      className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear file
                    </button>
                  </div>
                  <div 
                    className="border border-pink-200 rounded-lg overflow-hidden bg-white"
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-64 object-contain" 
                    />
                  </div>
                </div>
              )}
              
              {/* Drop Zone (when no preview) */}
              {!preview && (
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={openFileSelector}
                  className={`border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center h-64 ${
                    dragActive 
                      ? "border-pink-500 bg-pink-50" 
                      : "border-pink-300 hover:border-pink-400 hover:bg-pink-50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0h8m-8 0a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {dragActive ? "Drop your image here" : "Drag & drop or click to upload"}
                  </div>
                </div>
              )}
              
              {/* Analyze Button */}
              <button
                onClick={handleUpload}
                disabled={loading || !image}
                className={`mt-4 w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                  loading || !image
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing..." : "Upload & Analyze"}
              </button>
            </div>
            
            {/* Right Panel (Output) */}
            <div className="bg-pink-50 rounded-lg border border-pink-100 p-6">
              {analysis ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-pink-100">
                    <p className="text-gray-800">{getDescriptiveAnalysis()}</p>
                    <div className="mt-3 flex items-center">
                      <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-600 font-medium">Succeeded</span>
                    </div>
                  </div>
                  
                  {/* Additional Details (Collapsible) */}
                  <div className="bg-white rounded-lg p-4 border border-pink-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">Detailed Analysis</h3>
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex">
                        <span className="font-medium w-32 text-gray-700">Category:</span>
                        <span className="text-gray-800">{analysis.category}</span>
                      </div>
                      {analysis.detectedEntity && (
                        <div className="flex">
                          <span className="font-medium w-32 text-gray-700">Entity:</span>
                          <span className="text-gray-800">{analysis.detectedEntity}</span>
                        </div>
                      )}
                      {analysis.labels && analysis.labels.length > 0 && (
                        <div className="flex">
                          <span className="font-medium w-32 text-gray-700">Labels:</span>
                          <span className="text-gray-800">{analysis.labels.join(", ")}</span>
                        </div>
                      )}
                      {analysis.faceDetails && analysis.faceDetails !== "No face detected." && (
                        <div className="flex">
                          <span className="font-medium w-32 text-gray-700">Face Details:</span>
                          <span className="text-gray-800">{analysis.faceDetails}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    {loading ? (
                      <div>
                        <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p>Analyzing your image...</p>
                      </div>
                    ) : (
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Upload an image to see the AI analysis</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;