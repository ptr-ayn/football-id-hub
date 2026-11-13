import { Link } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, ClipboardCheck, ShieldAlert, Users } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ds/page-header";
import { Section } from "@/components/ds/section";
import { EmptyState, PermissionState } from "@/components/ds/states";
import { ChildSelector } from "@/features/children/child-selector";
import {
  getCurrentGuardianId,
  getCurrentUser,
  getPlayerByFootballId,
  getTeam,
  listCurrentGuardianChildren,
  listPlayers,
  listSchedule,
  listTeams,
} from "@/data/repository";
import { getCoachAssignedTeams } from "@/lib/coach-access";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

const ALLOWED_ROLES = ["coach", "org_admin", "parent", "player"] as const;

export function AttendancePage() {
  const { role, ready } = useRole();
  const [selectedChildId, setSelectedChildId] = useState("");

  if (!ready) {
    return <PermissionState title="Attendance access unavailable" description="The active workspace scope has not been resolved yet." />;
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return <PermissionState title="Attendance is not available for this role" description="This view is intended for coaches, guardians, org admins and players." />;
  }

  const guardianId = role === "parent" ? getCurrentGuardianId() : undefined;
  const linkedChildren = role === "parent" ? listCurrentGuardianChildren() : [];
  const eligibleChildren = guardianId
    ? linkedChildren.filter((child) => child.teamId)
    : [];
  const selectedChild = eligibleChildren.find((child) => child.id === selectedChildId) ?? eligibleChildren[0];

  const teamIds = useMemo(() => {
    if (role === "parent") {
      return selectedChild?.teamId ? [selectedChild.teamId] : [];
    }
    if (role === "coach") {
      return getCoachAssignedTeams().map((team) => team.id);
    }
    if (role === "player") {
      const currentPlayer = getPlayerByFootballId(getCurrentUser().footballId);
      return currentPlayer?.teamId ? [currentPlayer.teamId] : [];
    }
    return listTeams("garuda").map((team) => team.id);
  }, [role, selectedChild]);

  const visiblePlayers = useMemo(() => {
    if (role === "parent" && selectedChild) return [selectedChild];
    if (teamIds.length === 0) return [];
    return teamIds.flatMap((teamId) => listPlayers({ teamId })).filter(Boolean);
  }, [role, selectedChild, teamIds]);

  const sessions = useMemo(() => listSchedule(teamIds).slice(0, 4), [teamIds]);
  const attendanceRate = useMemo(() => {
    if (!visiblePlayers.length) return 0;
    const average = visiblePlayers.reduce((total, player) => total + (player.attendance ?? 0), 0) / visiblePlayers.length;
    return Math.round(average);
  }, [visiblePlayers]);

  if (role === "parent" && linkedChildren.length > 0 && eligibleChildren.length === 0) {
    return (
      <PermissionState
        title="Attendance access unavailable"
        description="A child must be linked to your Football ID and assigned to a team before attendance can be shown."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Check-in status, training frequency and attendance coverage across the current roster."
        actions={
          <Button asChild variant="outline">
            <Link to="/check-in">Record a check-in</Link>
          </Button>
        }
      />

      {role === "parent" && eligibleChildren.length > 0 && (
        <ChildSelector
          children={eligibleChildren}
          value={selectedChild?.id ?? eligibleChildren[0].id}
          onChange={setSelectedChildId}
        />
      )}

      {role === "parent" && !selectedChild ? (
        <EmptyState title="No linked child on a team" description="Add or link a child before viewing attendance records." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard icon={<ClipboardCheck className="size-5" />} label="Attendance rate" value={`${attendanceRate}%`} description="Last 30 days" />
            <StatCard icon={<Users className="size-5" />} label="Visible players" value={String(visiblePlayers.length)} description="Current roster" />
            <StatCard icon={<CalendarClock className="size-5" />} label="Sessions" value={String(sessions.length)} description="Upcoming and scheduled" />
            <StatCard icon={<CheckCircle2 className="size-5" />} label="Health" value={attendanceRate >= 80 ? "On track" : "Review"} description={attendanceRate >= 80 ? "Strong coverage" : "Check in with training lead"} emphasis={attendanceRate >= 80} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <Section title="Upcoming sessions" description="Sessions tied to the visible roster">
              {sessions.length ? (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const team = session.teamId ? getTeam(session.teamId) : undefined;
                    return (
                      <div key={session.id} className="rounded-xl border bg-muted/20 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-label text-muted-foreground">{session.type}</div>
                            <div className="text-lg font-semibold text-foreground">{session.title}</div>
                          </div>
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                            {team?.name ?? "Club"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{session.date}</span>
                          <span>{session.start} – {session.end}</span>
                          <span>{session.location}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Nothing scheduled" description="No activities are currently scheduled for the visible roster." />
              )}
            </Section>

            <Section title="Roster snapshot" description="Current attendance signal by player">
              {visiblePlayers.length ? (
                <div className="space-y-3">
                  {visiblePlayers.map((player) => (
                    <div key={player.id} className="space-y-2 rounded-lg border bg-card p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-foreground">{player.nickname ?? player.name}</div>
                          <div className="text-xs text-muted-foreground">{player.positionLabel}</div>
                        </div>
                        <span className={cn("text-sm font-semibold", player.attendance >= 80 ? "text-success" : "text-warning")}>
                          {player.attendance}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", player.attendance >= 80 ? "bg-success" : player.attendance >= 60 ? "bg-warning" : "bg-destructive")}
                          style={{ width: `${Math.min(player.attendance, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 p-4 text-sm text-muted-foreground">
                  <ShieldAlert className="size-4" />
                  No roster is available in the current view.
                </div>
              )}
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
  emphasis,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  emphasis?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border p-4", emphasis ? "border-primary/30 bg-primary/5" : "bg-card")}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className={cn("grid size-8 place-items-center rounded-lg", emphasis ? "bg-primary/10 text-primary" : "bg-muted text-foreground")}>
          {icon}
        </span>
        <span className="text-label">{label}</span>
      </div>
      <div className="mt-4 text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{description}</div>
    </div>
  );
}
