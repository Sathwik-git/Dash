import { FileData, FileNode } from "./types";

/**
 * Parse the XML-like boltArtifact and extract filePath + content
 * @param xml - The XML-like string input
 * @returns Array of file data objects with filePath and content
 */
export function parseBoltXml(xml: string): FileData[] {
  const regex =
    /<boltAction type="file" filePath="(.*?)">\s*([\s\S]*?)<\/boltAction>/g;
  const matches: FileData[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    matches.push({
      filePath: match[1],
      content: match[2].trim(),
    });
  }

  return matches;
}

/**
 * Build a file tree from a flat list of files
 * @param files - Array of file data
 * @returns Tree structure of folders and files
 */
export function buildFileTree(files: FileData[]): FileNode[] {
  const root: FileNode[] = [];

  function addToTree(
    parts: string[],
    content: string,
    currentLevel: FileNode[],
    fullPath: string
  ): void {
    const [head, ...rest] = parts;
    const currentPath = fullPath ? `${fullPath}/${head}` : head;
    let existing = currentLevel.find((node) => node.name === head);

    if (rest.length === 0) {
      // It's a file
      if (!existing) {
        const fileNode: FileNode = {
          name: head,
          type: "file",
          content,
          path: currentPath,
        };
        currentLevel.push(fileNode);
      }
    } else {
      // It's a folder
      if (!existing) {
        const newFolder: FileNode = {
          name: head,
          type: "folder",
          isOpen: true,
          children: [],
          path: currentPath,
        };
        currentLevel.push(newFolder);
        addToTree(rest, content, newFolder.children!, currentPath);
      } else if (existing.type === "folder") {
        addToTree(rest, content, existing.children!, currentPath);
      }
    }
  }

  for (const file of files) {
    const parts = file.filePath.split("/");
    addToTree(parts, file.content, root, "");
  }

  return root;
}

