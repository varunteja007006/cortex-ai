import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { MessageSquareIcon } from "lucide-react"

export default function ChatPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Chat" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <MessageSquareIcon className="size-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Chat</h2>
          <p className="text-sm text-muted-foreground">
            Your chat conversations will appear here.
          </p>
        </div>
      </div>
    </>
  )
}
