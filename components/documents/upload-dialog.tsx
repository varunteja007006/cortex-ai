"use client"

import { useId } from "react"
import { UploadCloud } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Destination folder chosen from the tree (required before upload) */
  folderName: string | null
}

/**
 * Reusable upload dialog with a sticky header + footer and a scrollable body.
 * Content scrolls (max-h-80) while header/footer stay pinned.
 */
export function UploadDocumentDialog({
  open,
  onOpenChange,
  folderName,
}: UploadDocumentDialogProps) {
  const dropId = useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="sticky top-0 z-10 shrink-0 border-b bg-popover p-4">
          <DialogTitle>Upload documents</DialogTitle>
          <DialogDescription>
            Uploading to <span className="font-medium text-foreground">{folderName}</span>.
            Large files may take a moment to process.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <label
            htmlFor={dropId}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors hover:bg-muted/50"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <UploadCloud className="size-5" />
            </span>
            <span className="text-sm font-medium">
              Drop files here or click to browse
            </span>
            <span className="text-xs text-muted-foreground">
              PDF, Markdown, or text files up to 10MB
            </span>
            <input
              id={dropId}
              type="file"
              multiple
              className={cn("hidden")}
            />
          </label>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 m-0 shrink-0 rounded-none bg-popover p-4">
          <Button onClick={() => onOpenChange(false)}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}