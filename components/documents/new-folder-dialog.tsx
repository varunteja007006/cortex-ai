"use client"

import { useState } from "react"

import { useCreateFolder } from "@/api/folders/query"
import type { Topic } from "@/api/topics/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const MAX_NAME_LENGTH = 150

interface NewFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topics: Topic[]
}

export function NewFolderDialog({
  open,
  onOpenChange,
  topics,
}: NewFolderDialogProps) {
  const [topicId, setTopicId] = useState("")
  const [name, setName] = useState("")
  const createFolder = useCreateFolder()

  const handleSubmit = () => {
    if (!name.trim() || !topicId) return
    createFolder.mutate(
      { topicId, name: name.trim() },
      {
        onSuccess: () => {
          setTopicId("")
          setName("")
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>
            Documents are uploaded into folders inside a topic.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="folder-topic">Topic</Label>
          <Select
            value={topicId}
            onValueChange={(value) => setTopicId(value ?? "")}
          >
            <SelectTrigger id="folder-topic" className="w-full">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label htmlFor="folder-name">Name</Label>
          <Input
            id="folder-name"
            placeholder="e.g. Drafts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <p
            className={cn(
              "text-xs",
              name.length <= MAX_NAME_LENGTH
                ? "text-emerald-500"
                : "text-destructive",
            )}
          >
            {name.length} / {MAX_NAME_LENGTH}
          </p>
          {createFolder.isError && (
            <p className="text-xs text-destructive">
              {createFolder.error?.message ?? "Could not create folder."}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !topicId || createFolder.isPending}
          >
            {createFolder.isPending ? "Creating…" : "Create folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}