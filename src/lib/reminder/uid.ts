export function generateReminderUid(firstReminderAt: Date): string {
  const stamp = firstReminderAt.toISOString().replace(/[-:]/g, "").split(".")[0];
  return `luna-vote-reminder-${stamp}@voteforluna.local`;
}
