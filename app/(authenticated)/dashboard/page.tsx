import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { DocumentsTable } from "@/components/documents-table"

export default function DashboardPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents" },
        ]}
      />
      <DocumentsTable />
    </>
  )
}
