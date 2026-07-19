import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, ChevronDown, ChevronRight, FileJson, FileText, Settings } from 'lucide-react';
import { GeneratedFile } from '../types';

interface FileTreeProps {
  files: GeneratedFile[];
  selectedFilePath: string;
  onSelectFile: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: Record<string, TreeNode>;
  file?: GeneratedFile;
}

export default function FileTree({ files, selectedFilePath, onSelectFile }: FileTreeProps) {
  const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>({});

  // Parse files array into a hierarchical tree
  const buildTree = (filesList: GeneratedFile[]): TreeNode => {
    const root: TreeNode = { name: 'Root', path: '', type: 'directory', children: {} };

    filesList.forEach((file) => {
      const parts = file.path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');

        if (isLast) {
          if (current.children) {
            current.children[part] = {
              name: part,
              path: file.path,
              type: 'file',
              file,
            };
          }
        } else {
          if (current.children) {
            if (!current.children[part]) {
              current.children[part] = {
                name: part,
                path: currentPath,
                type: 'directory',
                children: {},
              };
            }
            current = current.children[part];
          }
        }
      });
    });

    return root;
  };

  const toggleDirectory = (dirPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedDirs((prev) => ({
      ...prev,
      [dirPath]: !prev[dirPath],
    }));
  };

  const getFileIcon = (fileName: string, language: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('config') || lowerName.includes('.ini') || lowerName.includes('properties')) {
      return <Settings className="w-4 h-4 text-amber-400" id={`icon-settings-${fileName}`} />;
    }
    if (lowerName.endsWith('.json')) {
      return <FileJson className="w-4 h-4 text-blue-400" id={`icon-json-${fileName}`} />;
    }
    if (lowerName.endsWith('.md')) {
      return <FileText className="w-4 h-4 text-emerald-400" id={`icon-text-${fileName}`} />;
    }
    
    // Default file icons per language
    switch (language) {
      case 'java':
        return <FileCode className="w-4 h-4 text-orange-400" id={`icon-java-${fileName}`} />;
      case 'python':
        return <FileCode className="w-4 h-4 text-sky-400" id={`icon-python-${fileName}`} />;
      case 'typescript':
      case 'javascript':
        return <FileCode className="w-4 h-4 text-yellow-400" id={`icon-js-${fileName}`} />;
      case 'csharp':
        return <FileCode className="w-4 h-4 text-purple-400" id={`icon-csharp-${fileName}`} />;
      case 'ruby':
        return <FileCode className="w-4 h-4 text-red-500" id={`icon-ruby-${fileName}`} />;
      default:
        return <FileCode className="w-4 h-4 text-slate-400" id={`icon-default-${fileName}`} />;
    }
  };

  const tree = buildTree(files);

  const renderNode = (node: TreeNode, depth: number = 0) => {
    if (node.type === 'file') {
      const isSelected = node.path === selectedFilePath;
      return (
        <div
          key={node.path}
          id={`file-node-${node.path.replace(/[/.]/g, '-')}`}
          className={`flex items-center gap-2 py-1.5 px-3 cursor-pointer rounded-md text-sm transition-all duration-150 group hover:bg-brand-border/40 ${
            isSelected ? 'bg-brand-border text-indigo-400 font-medium border-l-2 border-indigo-400' : 'text-slate-300'
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
          onClick={() => onSelectFile(node.path)}
        >
          {getFileIcon(node.name, node.file?.language || '')}
          <span className="truncate group-hover:text-white transition-colors">{node.name}</span>
        </div>
      );
    }

    const isCollapsed = collapsedDirs[node.path] || false;
    const hasChildren = node.children && Object.keys(node.children).length > 0;

    return (
      <div key={node.path || 'root-container'} id={`dir-node-${node.path.replace(/[/.]/g, '-') || 'root'}`}>
        {node.path && (
          <div
            className="flex items-center justify-between py-1.5 px-3 cursor-pointer rounded-md text-sm text-slate-400 hover:bg-brand-border/30 hover:text-white transition-all duration-150"
            style={{ paddingLeft: `${depth * 12}px` }}
            onClick={(e) => toggleDirectory(node.path, e)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isCollapsed ? (
                <Folder className="w-4 h-4 text-indigo-400 shrink-0" />
              ) : (
                <FolderOpen className="w-4 h-4 text-indigo-300 shrink-0" />
              )}
              <span className="truncate font-medium">{node.name}</span>
            </div>
            {hasChildren && (
              <div className="shrink-0 p-0.5 rounded hover:bg-brand-border text-slate-500 hover:text-slate-300">
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            )}
          </div>
        )}

        {!isCollapsed && node.children && (
          <div className="flex flex-col mt-0.5">
            {Object.values(node.children)
              .sort((a, b) => {
                // Directories first, then alphabetical
                if (a.type !== b.type) {
                  return a.type === 'directory' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
              })
              .map((child) => renderNode(child, node.path ? depth + 1 : depth))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-brand-tree border border-brand-border rounded-lg overflow-hidden" id="file-tree-container">
      <div className="flex items-center gap-2 px-4 py-3 bg-brand-tree border-b border-brand-border shrink-0">
        <FolderOpen className="w-4 h-4 text-indigo-400" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Project Structure</span>
        <span className="ml-auto text-[10px] bg-brand-border text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
          {files.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {Object.values(tree.children || {}).length > 0 ? (
          renderNode(tree)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-center">
            <span className="text-xs">No files generated yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
