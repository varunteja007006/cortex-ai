"use client"

import { useState } from "react"
import { ChevronRight, FileText, Folder as FolderIcon, FolderOpen } from "lucide-react"

import type { Document } from "@/api/documents/types"
import type { Topic } from "@/api/topics/types"
import type { Folder } from "@/api/folders/types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type FolderNode = {
  folder: Folder
  children: FolderNode[]
  documents: Document[]
}

type TopicNode = {
  topic: Topic | null
  folders: FolderNode[]
  documents: Document[]
}

function buildFolderNodes(folders: Folder[]): FolderNode[] {
  const nodes = new Map<string, FolderNode>()
  const roots: FolderNode[] = []

  for (const folder of folders) {
    nodes.set(folder.id, { folder, children: [], documents: [] })
  }

  for (const folder of folders) {
    const node = nodes.get(folder.id)!
    if (folder.parentFolderId && nodes.has(folder.parentFolderId)) {
      nodes.get(folder.parentFolderId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots.sort((a, b) => a.folder.position - b.folder.position)
}

interface DocumentsTreeProps {
  topics: Topic[]
  folders: Folder[]
  documents: Document[]
  selectedFolderId: string | null
  onSelectFolder: (folderId: string) => void
}

export function DocumentsTree({
  topics,
  folders,
  documents,
  selectedFolderId,
  onSelectFolder,
}: DocumentsTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

  const folderNodes = buildFolderNodes(folders)

  // Group documents by destination
  const docsByFolder = new Map<string, Document[]>()
  const docsByTopic = new Map<string, Document[]>()
  const uncategorized: Document[] = []

  for (const doc of documents) {
    if (doc.folderId) {
      const list = docsByFolder.get(doc.folderId) ?? []
      list.push(doc)
      docsByFolder.set(doc.folderId, list)
    } else if (doc.topicId) {
      const list = docsByTopic.get(doc.topicId) ?? []
      list.push(doc)
      docsByTopic.set(doc.topicId, list)
    } else {
      uncategorized.push(doc)
    }
  }

  // Folders whose topic is not loaded still appear under Uncategorized
  const topicNodes: TopicNode[] = topics.map((topic) => ({
    topic,
    folders: folderNodes.filter((n) => n.folder.topicId === topic.id),
    documents: docsByTopic.get(topic.id) ?? [],
  }))

  const orphanFolders = folderNodes.filter(
    (n) => !topics.some((t) => t.id === n.folder.topicId),
  )

  const showUncategorized =
    uncategorized.length > 0 || orphanFolders.length > 0

  const toggleSet = (set: Set<string>, key: string) =>
    set.has(key) ? new Set([...set].filter((k) => k !== key)) : new Set(set).add(key)

  return (
    <div className="w-full rounded-lg border">
      {documents.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          No documents yet.
        </p>
      ) : (
        <ul className="p-2">
          {topicNodes.map((node) => (
            <TopicRow
              key={node.topic!.id}
              node={node}
              expanded={expandedTopics}
              expandedFolders={expandedFolders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onToggleTopic={(id) =>
                setExpandedTopics(toggleSet(expandedTopics, id))
              }
              onToggleFolder={(id) =>
                setExpandedFolders(toggleSet(expandedFolders, id))
              }
            />
          ))}
          {showUncategorized && (
            <TopicRow
              key="uncategorized"
              node={{
                topic: null,
                folders: orphanFolders,
                documents: uncategorized,
              }}
              expanded={expandedTopics}
              expandedFolders={expandedFolders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onToggleTopic={(id) => setExpandedTopics(toggleSet(expandedTopics, id))}
              onToggleFolder={(id) =>
                setExpandedFolders(toggleSet(expandedFolders, id))
              }
            />
          )}
        </ul>
      )}
    </div>
  )
}

interface RowSharedProps {
  expanded: Set<string>
  expandedFolders: Set<string>
  selectedFolderId: string | null
  onSelectFolder: (folderId: string) => void
  onToggleTopic: (id: string) => void
  onToggleFolder: (id: string) => void
}

function TopicRow({
  node,
  ...props
}: RowSharedProps & { node: TopicNode }) {
  const id = node.topic ? node.topic.id : "uncategorized"
  const isOpen = props.expanded.has(id)
  const isEmpty =
    node.folders.length === 0 && node.documents.length === 0

  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={() => props.onToggleTopic(id)}>
        <CollapsibleTrigger
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-90"
            )}
          />
          <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">
            {node.topic ? node.topic.name : "Uncategorized"}
          </span>
          {isEmpty && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Empty
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul>
            {node.folders.map((child) => (
              <FolderRow
                key={child.folder.id}
                node={child}
                depth={1}
                {...props}
              />
            ))}
            {node.documents.map((doc) => (
              <FileRow key={doc.id} doc={doc} depth={1} />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function FolderRow({
  node,
  depth,
  ...props
}: RowSharedProps & { node: FolderNode; depth: number }) {
  const id = node.folder.id
  const isOpen = props.expandedFolders.has(id)
  const isSelected = props.selectedFolderId === id

  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={() => props.onToggleFolder(id)}>
        <CollapsibleTrigger
          onClick={() => props.onSelectFolder(id)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
            isSelected && "bg-muted font-medium"
          )}
          style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-90"
            )}
          />
          <FolderIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              isSelected && "text-primary"
            )}
          />
          <span className="truncate">{node.folder.name}</span>
          {node.documents.length > 0 && (
            <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
              {node.documents.length}
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul>
            {node.children.map((child) => (
              <FolderRow
                key={child.folder.id}
                node={child}
                depth={depth + 1}
                {...props}
              />
            ))}
            {node.documents.map((doc) => (
              <FileRow key={doc.id} doc={doc} depth={depth + 1} />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function FileRow({ doc, depth }: { doc: Document; depth: number }) {
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        <span className="w-4" />
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{doc.filename}</span>
        <span className="ml-auto shrink-0">
          <Badge variant={doc.ingested ? "default" : "secondary"} className="text-xs">
            {doc.ingested ? "Ingested" : "Pending"}
          </Badge>
        </span>
      </div>
    </li>
  )
}