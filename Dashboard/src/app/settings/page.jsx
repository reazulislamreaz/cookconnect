import { redirect } from "next/navigation";

// "settings" in the sidebar is a disclosure, not a destination. Anyone who
// lands on the bare path — a bookmark, a typed URL — goes to the first item
// under it rather than to an empty shell.
export default function SettingsIndex() {
  redirect("/settings/homepage");
}
