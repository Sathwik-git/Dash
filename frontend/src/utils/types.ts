// types.ts (you can keep this in a separate file if desired)
export type FileData = {
  filePath: string;
  content: string;
};

export type FileNode = {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  path:string
}










