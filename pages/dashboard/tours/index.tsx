import type { NextPage } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const DashboardToursPlaceholder: NextPage = () => {
  return (
    <DashboardLayout>
      <p className="text-sm text-on-surface-variant">
        Tours management is planned for a later dashboard release.
      </p>
    </DashboardLayout>
  );
};

export default DashboardToursPlaceholder;
