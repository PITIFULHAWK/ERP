import { ProtectedRoute } from "@/components/auth/protected-route"
import { DocumentManager } from "@/components/documents/document-manager"

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Document Management</h1>
          <p className="text-muted-foreground">
            Track and manage all your uploaded documents and their verification status.
          </p>
        </div>

        <DocumentManager />
      </div>
    </ProtectedRoute>
  )
}
