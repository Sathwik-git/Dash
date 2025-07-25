import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import CodePreview from "../components/CodePreview";
import Chat from "../components/Chat";
import { Menu, X } from "lucide-react";
import { FileNode } from "../utils/types";
const EditorPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt || "";
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const handleFileTreeUpdate = (newFileTree: FileNode[]) => {
    setFileTree(newFileTree);
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Column - Chat Section with Independent Scrolling */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:relative lg:translate-x-0 z-50 lg:z-0 w-80 lg:w-[450px] h-full bg-[#1e1e1e] border-r border-[#2d2d30] flex flex-col transition-transform duration-300 ease-in-out overflow-hidden`}
        >
          {/* Mobile close button - Fixed within left column */}
          <div className="lg:hidden flex justify-end p-4 flex-shrink-0 border-b border-[#2d2d30]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-[#cccccc] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complete Chat Interface - Independent Scrollable Container */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Chat initialPrompt={initialPrompt} onFileTreeUpdate={handleFileTreeUpdate}/>
          </div>
        </div>

        {/* Right Column - Content Section with Independent Scrolling */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile menu button - Fixed within right column */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-[#252526] border-b border-[#2d2d30] flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#cccccc] hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  !showPreview
                    ? "bg-[#007acc] text-white"
                    : "text-[#cccccc] hover:text-white"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  showPreview
                    ? "bg-[#007acc] text-white"
                    : "text-[#cccccc] hover:text-white"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Code/Preview Area - Independent Scrollable Container */}
          <div className="flex-1 overflow-hidden min-h-0">
            <CodePreview
              showPreview={showPreview}
              onTogglePreview={setShowPreview}
              fileTree = {fileTree}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
