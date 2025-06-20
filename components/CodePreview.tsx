'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check,
  Download,
  Code,
  File
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { CodePreviewProps, GeneratedFile } from '@/types'

export default function CodePreview({ files, isGenerating, prompt }: CodePreviewProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  // Organize files into a tree structure
  const fileTree = organizeFilesIntoTree(files)

  const handleCopyFile = async (file: GeneratedFile) => {
    try {
      await navigator.clipboard.writeText(file.content)
      setCopiedFile(file.path)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (error) {
      console.error('Failed to copy file content:', error)
    }
  }

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'tsx':
      case 'jsx':
        return '⚛️'
      case 'ts':
        return '🔷'
      case 'js':
        return '📜'
      case 'json':
        return '📋'
      case 'md':
        return '📝'
      default:
        return '📄'
    }
  }

  const getLanguage = (fileType: GeneratedFile['type']): string => {
    switch (fileType) {
      case 'tsx':
      case 'jsx':
        return 'tsx'
      case 'ts':
        return 'typescript'
      case 'js':
        return 'javascript'
      case 'json':
        return 'json'
      case 'md':
        return 'markdown'
      default:
        return 'text'
    }
  }

     const renderFileTree = (tree: { [key: string]: FileTreeNode | FileNode }, depth = 0): React.ReactNode => {
     return Object.entries(tree).map(([name, node]) => {
      const isFolder = 'children' in node
      const fullPath = node.path || name
      const isExpanded = expandedFolders.has(fullPath)

      if (isFolder) {
        return (
          <div key={name} style={{ marginLeft: `${depth * 16}px` }}>
            <button
              onClick={() => toggleFolder(fullPath)}
              className="flex items-center space-x-2 w-full text-left py-1 px-2 hover:bg-slate-100 rounded text-sm"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-slate-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-500" />
              )}
              <Folder className="w-4 h-4 text-blue-500" />
              <span className="text-slate-700 font-medium">{name}</span>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                                     {renderFileTree(node.children as { [key: string]: FileTreeNode | FileNode }, depth + 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      } else {
        return (
          <button
            key={name}
            onClick={() => setSelectedFile(node.path)}
            style={{ marginLeft: `${(depth + 1) * 16}px` }}
            className={`flex items-center space-x-2 w-full text-left py-1 px-2 rounded text-sm transition-colors ${
              selectedFile === node.path
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span className="text-base">{getFileIcon(name)}</span>
            <span className="truncate">{name}</span>
          </button>
        )
      }
    })
  }

  const selectedFileData = files.find(f => f.path === selectedFile)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden h-full"
    >
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Generated Code</h3>
          </div>
          {files.length > 0 && (
            <span className="text-sm text-slate-500">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {prompt && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
            {prompt}
          </p>
        )}
      </div>

      <div className="flex h-96">
        {/* File Explorer */}
        <div className="w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto">
          {files.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              {isGenerating ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm">Generating files...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileText className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-sm">No files generated yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              <div className="flex items-center space-x-2 mb-2 px-2">
                <Folder className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700">Project Files</span>
              </div>
              {renderFileTree(fileTree)}
            </div>
          )}
        </div>

        {/* Code Viewer */}
        <div className="flex-1 flex flex-col">
          {selectedFileData ? (
            <>
              {/* File Header */}
              <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getFileIcon(selectedFileData.path)}</span>
                  <span className="text-sm font-mono">{selectedFileData.path}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyFile(selectedFileData)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                    title="Copy file content"
                  >
                    {copiedFile === selectedFileData.path ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <div className="flex-1 overflow-auto">
                <SyntaxHighlighter
                  language={getLanguage(selectedFileData.type)}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: '13px',
                    lineHeight: '1.5'
                  }}
                  showLineNumbers
                  wrapLines
                >
                  {selectedFileData.content}
                </SyntaxHighlighter>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Select a file to preview</p>
                <p className="text-sm mt-1">
                  {files.length > 0 
                    ? 'Choose a file from the explorer to view its contents'
                    : 'Files will appear here after generation'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Helper types and functions
interface FileTreeNode {
  path: string
  children: { [key: string]: FileTreeNode }
}

interface FileNode {
  path: string
}

function organizeFilesIntoTree(files: GeneratedFile[]): { [key: string]: FileTreeNode | FileNode } {
  const tree: { [key: string]: any } = {}

  files.forEach(file => {
    const parts = file.path.split('/')
    let current = tree

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // This is a file
        current[part] = { path: file.path }
      } else {
        // This is a folder
        if (!current[part]) {
          current[part] = {
            path: parts.slice(0, index + 1).join('/'),
            children: {}
          }
        }
        current = current[part].children
      }
    })
  })

  return tree
} 