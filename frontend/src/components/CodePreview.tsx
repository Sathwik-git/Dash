import React, { useState } from "react";
import {
  Code,
  Eye,
  Copy,
  Download,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Terminal,
  Zap,
} from "lucide-react";
import JSZip from "jszip";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { useWebContainer } from "../hooks/useWebContainer";
import { PreviewApp } from "./PreviewApp";
import { useEffect } from "react";

interface CodePreviewProps {
  showPreview: boolean;
  onTogglePreview: (show: boolean) => void;
  fileTree?: FileNode[];
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  isOpen?: boolean;
  path: string;
}

type WebContainerFile = {
  file: {
    contents: string;
  };
};

type WebContainerDirectory = {
  directory: WebContainerStructure;
};

type WebContainerStructure = {
  [name: string]: WebContainerFile | WebContainerDirectory;
};

type WebContainerProjectFiles = {
  myProject: WebContainerDirectory;
};

const CodePreview: React.FC<CodePreviewProps> = ({
  showPreview,
  onTogglePreview,
  fileTree,
}) => {
  const webcontainer = useWebContainer();
  function convertTreeToWebContainerFormat(
    tree: FileNode[]
  ): WebContainerProjectFiles {
    function recurse(nodes: FileNode[]): WebContainerStructure {
      const result: WebContainerStructure = {};

      for (const node of nodes) {
        if (node.type === "file") {
          result[node.name] = {
            file: {
              contents: node.content ?? "", // fallback to empty string if undefined
            },
          };
        } else if (node.type === "folder") {
          result[node.name] = {
            directory: recurse(node.children ?? []),
          };
        }
      }

      return result;
    }

    return {
      myProject: {
        directory: recurse(tree),
      },
    };
  }
  useEffect(() => {
    if (webcontainer && fileTree) {
      const projectFiles = convertTreeToWebContainerFormat(fileTree);
      console.log(
        `PROJECT FILES ${JSON.stringify(projectFiles.myProject.directory)}`
      );
      webcontainer?.mount(projectFiles.myProject.directory);
    }
  }, [webcontainer, fileTree]);
  const defaultTree: FileNode[] = [];
  const currentTree: FileNode[] =
    fileTree && fileTree.length > 0 ? fileTree : defaultTree;

  const [selectedFile, setSelectedFile] = useState("src/");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(["src"]));

  // Find file content by path
  const findFileContent = (
    nodes: FileNode[],
    targetPath: string
  ): string | null => {
    for (const node of nodes) {
      if (node.path === targetPath && node.type === "file") {
        return node.content || null;
      }
      if (node.children) {
        const found = findFileContent(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Get current file content
  const getCurrentFileContent = () => {
    const content = findFileContent(currentTree, selectedFile);
    return content || `//generating...`;
  };

  // Get file extension for language detection
  const getFileExtension = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext || "txt";
  };

  // Get CodeMirror language extension
  const getLanguageExtension = (extension: string) => {
    switch (extension) {
      case "json":
        return [json()];
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return [javascript({ jsx: true, typescript: true })];
      default:
        return [];
    }
  };

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node, index) => {
      const isSelected = selectedFile === node.path;
      const isOpen = openFolders.has(node.path);

      return (
        <div key={index}>
          <div
            className={`flex items-center space-x-1 px-2 py-0.5 text-sm cursor-pointer hover:bg-[#2a2d2e] transition-colors ${
              isSelected ? "bg-[#37373d] text-[#cccccc]" : "text-[#cccccc]"
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => {
              if (node.type === "folder") {
                toggleFolder(node.path);
              } else {
                setSelectedFile(node.path);
              }
            }}
          >
            {node.type === "folder" ? (
              <>
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-[#cccccc] flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#cccccc] flex-shrink-0" />
                )}
                <Folder className="w-4 h-4 text-[#dcb67a] flex-shrink-0" />
              </>
            ) : (
              <>
                <div className="w-3 flex-shrink-0"></div>
                <File className="w-4 h-4 text-[#519aba] flex-shrink-0" />
              </>
            )}
            <span className="truncate text-xs">{node.name}</span>
          </div>
          {node.type === "folder" && isOpen && node.children && (
            <div>{renderFileTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  const currentFileContent = getCurrentFileContent();
  const fileExtension = getFileExtension(selectedFile);
  const languageExtensions = getLanguageExtension(fileExtension);

  // CodeMirror extensions
  const extensions = [
    ...languageExtensions,
    EditorView.theme({
      "&": {
        fontSize: "14px",
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      },
      ".cm-content": {
        padding: "16px",
        minHeight: "100%",
      },
      ".cm-focused": {
        outline: "none",
      },
      ".cm-editor": {
        height: "100%",
      },
      ".cm-scroller": {
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      },
    }),
    EditorView.lineWrapping,
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentFileContent);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const downloadProject = async () => {
    const zip = new JSZip();

    // Recursively add files to ZIP
    const addFilesToZip = (nodes: FileNode[], folder: JSZip) => {
      nodes.forEach((node) => {
        if (node.type === "file" && node.content) {
          // Add file to ZIP with proper path structure
          const fileName = node.path.includes("/") ? node.path : node.name;
          folder.file(fileName, node.content);
        } else if (node.type === "folder" && node.children) {
          // Create folder and recursively add its contents
          const subFolder = folder.folder(node.name);
          if (subFolder) {
            addFilesToZip(node.children, subFolder);
          }
        }
      });
    };

    // Add all files from the file tree to ZIP
    addFilesToZip(currentTree, zip);

    try {
      // Generate ZIP file
      const content = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-app-builder-project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Header with tabs - Fixed */}
      <div className="flex items-center justify-between border-b border-[#2d2d30] bg-[#252526] flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => onTogglePreview(false)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
              !showPreview
                ? "text-[#cccccc] border-[#007acc] bg-[#1e1e1e]"
                : "text-[#969696] border-transparent hover:text-[#cccccc]"
            }`}
          >
            Code
          </button>
          <button
            onClick={() => onTogglePreview(true)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
              showPreview
                ? "text-[#cccccc] border-[#007acc] bg-[#1e1e1e]"
                : "text-[#969696] border-transparent hover:text-[#cccccc]"
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex items-center space-x-2 px-4">
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-[#cccccc] hover:bg-[#2a2d2e] transition-colors rounded"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={downloadProject}
            className="p-1.5 text-[#cccccc] hover:bg-[#2a2d2e] transition-colors rounded"
            title="Download project as ZIP"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content - Independent Scrollable Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {!showPreview && (
          <>
            {/* File Explorer - Independent Scrollable */}
            <div className="w-64 bg-[#252526] border-r border-[#2d2d30] flex flex-col overflow-hidden">
              <div className="p-2 border-b border-[#2d2d30] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-medium text-[#cccccc]">
                    <span className="text-xs">Files</span>
                  </div>
                  <div className="text-xs text-[#969696]">Explorer</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {renderFileTree(currentTree)}
              </div>
            </div>

            {/* Code Editor - Independent Scrollable */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* File tabs - Fixed */}
              <div className="flex items-center bg-[#2d2d30] border-b border-[#2d2d30] px-4 py-1 flex-shrink-0">
                <div className="flex items-center space-x-2 text-sm">
                  {selectedFile.includes("/") && (
                    <>
                      {selectedFile
                        .split("/")
                        .slice(0, -1)
                        .map((part, index) => (
                          <React.Fragment key={index}>
                            <span className="text-[#969696] text-xs">
                              {part}
                            </span>
                            <ChevronRight className="w-3 h-3 text-[#969696]" />
                          </React.Fragment>
                        ))}
                    </>
                  )}
                  <File className="w-4 h-4 text-[#519aba]" />
                  <span className="text-[#cccccc] text-xs">
                    {selectedFile.split("/").pop()}
                  </span>
                </div>
              </div>

              {/* CodeMirror Editor - Main scrollable area */}
              <div className="flex-1 min-h-0">
                <CodeMirror
                  value={currentFileContent}
                  height="100%"
                  theme={oneDark}
                  extensions={extensions}
                  editable={false}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    highlightSelectionMatches: false,
                    searchKeymap: true,
                  }}
                  style={{
                    height: "100%",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          </>
        )}

        {showPreview && <PreviewApp webContainer={webcontainer!} />}
      </div>
    </div>
  );
};

export default CodePreview;
