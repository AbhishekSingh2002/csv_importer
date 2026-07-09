import { PlaceholderPage } from "@/components/placeholder-page";
import { Table2 } from "lucide-react";

export default function CrmFieldsPage() {
  return (
    <PlaceholderPage
      title="CRM Fields"
      subtitle="Customize the fields captured for every lead."
      icon={Table2}
      note="The default + custom CRM field list used by the CSV importer is defined here in a real build."
    />
  );
}
