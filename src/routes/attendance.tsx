import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "@/features/attendance/attendance-page";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/attendance")({
  head: () => pageHead("Attendance", "Fast check-in and attendance overview for clubs, guardians and coaches."),
  component: AttendancePage,
});
