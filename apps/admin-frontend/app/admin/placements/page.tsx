import PlacementManagement from "@/components/placements/placement-management";

export default function PlacementsPage() {
    return (
        <div className="p-6 flex flex-col space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Placement Management</h1>
                <p className="text-muted-foreground">
                    Manage placement opportunities and send notifications to eligible students.
                </p>
            </div>
            <PlacementManagement />
        </div>
    );
}