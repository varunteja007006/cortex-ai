"use client"

import { useState } from "react"
import {
  FileText as FileTextIcon,
  Folder as FolderIcon,
  ListTree,
  Loader2,
  Table2,
  Upload,
} from "lucide-react"

import { useDocuments } from "@/api/documents/query"
import { useTopics } from "@/api/topics/query"
import { useAllFolders } from "@/api/folders/query"
import { DocumentsDataTable } from "@/components/documents-data-table"
import { DocumentsTree } from "@/components/documents/documents-tree"
import { UploadDocumentDialog } from "@/components/documents/upload-dialog"
import { NewTopicDialog } from "@/components/documents/new-topic-dialog"
import { NewFolderDialog } from "@/components/documents/new-folder-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type ViewMode = "tree" | "table"

export function DocumentsView() {
  const [view, setView] = useState<ViewMode>("tree")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)

  const { data: docs, isLoading: docsLoading } = useDocuments({ pageSize: 100 })
  const { data: topicsData, isLoading: topicsLoading } = useTopics()
  const { data: foldersData, isLoading: foldersLoading } = useAllFolders()

  const topics = topicsData?.topics ?? []
  const folders = foldersData?.folders ?? []

  const hasTopics = topics.length > 0
  const hasFolders = folders.length > 0
  const isLoading = topicsLoading || foldersLoading || docsLoading

  const selectedFolder =
    folders.find((f) => f.id === selectedFolderId) ?? null

  const handleUploadClick = () => {
    if (!selectedFolder) {
      setView("tree")
      return
    }
    setUploadOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasTopics) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>Create a topic to get started</EmptyTitle>
            <EmptyDescription>
              Documents are organized into topics and folders. Create your
              first topic before uploading anything.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button onClick={() => setTopicDialogOpen(true)}>New Topic</Button>
          </EmptyContent>
        </Empty>
        <NewTopicDialog
          open={topicDialogOpen}
          onOpenChange={setTopicDialogOpen}
        />
      </>
    )
  }

  if (!hasFolders) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderIcon />
            </EmptyMedia>
            <EmptyTitle>Add a folder to start uploading</EmptyTitle>
            <EmptyDescription>
              Uploads need a destination folder inside a topic. Create one
              first.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button onClick={() => setFolderDialogOpen(true)}>New Folder</Button>
          </EmptyContent>
        </Empty>
        <NewFolderDialog
          open={folderDialogOpen}
          onOpenChange={setFolderDialogOpen}
          topics={topics}
        />
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <ToggleGroup
          value={[view]}
          onValueChange={(value) =>
            setView(value[0] === "table" ? "table" : "tree")
          }
        >
          <ToggleGroupItem value="tree" aria-label="Tree view">
            <ListTree className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <Table2 className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setFolderDialogOpen(true)}>
            New Folder
          </Button>
          <Button onClick={handleUploadClick}>
            <Upload data-icon="inline-start" />
            Upload
          </Button>
        </div>
      </div>

      {view === "tree" ? (
        <div className="flex w-full flex-col gap-2">
          <DocumentsTree
            topics={topics}
            folders={folders}
            documents={docs?.documents ?? []}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
          />
          {!selectedFolder && (
            <p className="px-1 text-xs text-muted-foreground">
              Select a folder in the tree to enable uploads.
            </p>
          )}
        </div>
      ) : (
        <DocumentsDataTable />
      )}

      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderName={selectedFolder?.name ?? null}
      />

      <NewFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        topics={topics}
      />
    </div>
  )
}