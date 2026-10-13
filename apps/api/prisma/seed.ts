/**
 * Demo data for local development: four users (one per role, plus an extra member), the
 * "Acme Studio" workspace, a "Website Relaunch" project and a board of tasks.
 *
 * Re-running is safe: users are upserted by email and the demo workspace is rebuilt from scratch.
 * Run with `pnpm db:seed`.
 */
import { generateNKeysBetween } from 'fractional-indexing';

import { logger } from '../src/common/logger.js';
import { hashPassword } from '../src/common/password.js';
import { type Priority, type Role, type TaskStatus } from '../src/generated/prisma/enums.js';
import { prisma } from '../src/prisma/client.js';

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'taskflow-demo';

const USERS = [
  { key: 'alex', name: 'Alex Morgan', email: 'alex@taskflow.dev', role: 'OWNER' },
  { key: 'priya', name: 'Priya Shah', email: 'priya@taskflow.dev', role: 'ADMIN' },
  { key: 'sam', name: 'Sam Lee', email: 'sam@taskflow.dev', role: 'MEMBER' },
  { key: 'jordan', name: 'Jordan Kim', email: 'jordan@taskflow.dev', role: 'MEMBER' },
] as const satisfies readonly { key: string; name: string; email: string; role: Role }[];

type UserKey = (typeof USERS)[number]['key'];

interface SeedTask {
  title: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: UserKey;
  reporter: UserKey;
  /** Days from today; negative means overdue. */
  due?: number;
  description?: string;
  comments?: { author: UserKey; body: string }[];
}

/** Listed in board order within each status column; task numbers follow array order. */
const TASKS: SeedTask[] = [
  {
    title: 'Audit the current site for broken links',
    status: 'DONE',
    priority: 'MEDIUM',
    assignee: 'sam',
    reporter: 'priya',
  },
  {
    title: 'Agree on the new information architecture',
    status: 'DONE',
    priority: 'HIGH',
    assignee: 'priya',
    reporter: 'alex',
    description:
      'Card-sort results are in the research folder. Navigation drops from 9 to 5 items.',
  },
  {
    title: 'Pick a typeface pairing',
    status: 'DONE',
    priority: 'LOW',
    assignee: 'jordan',
    reporter: 'priya',
  },
  {
    title: 'Design the pricing page',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    assignee: 'jordan',
    reporter: 'alex',
    due: 2,
    comments: [
      { author: 'alex', body: 'Can we show annual pricing by default?' },
      { author: 'jordan', body: 'Yes, with a monthly toggle. Updated the Figma frame.' },
    ],
  },
  {
    title: 'Write copy for the About page',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    assignee: 'sam',
    reporter: 'priya',
    due: 4,
  },
  {
    title: 'Build the responsive navigation bar',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assignee: 'sam',
    reporter: 'priya',
    due: -1,
    description: 'Collapses into a sheet below 768px. Keyboard focus must stay trapped while open.',
    comments: [{ author: 'priya', body: 'This blocks the launch checklist, flagging as urgent.' }],
  },
  {
    title: 'Set up image optimisation pipeline',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignee: 'jordan',
    reporter: 'alex',
    due: 6,
  },
  {
    title: 'Migrate blog posts to MDX',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    assignee: 'alex',
    reporter: 'alex',
  },
  {
    title: 'Add cookie consent banner',
    status: 'TODO',
    priority: 'HIGH',
    assignee: 'priya',
    reporter: 'alex',
    due: 5,
  },
  {
    title: 'Hook the contact form up to the CRM',
    status: 'TODO',
    priority: 'MEDIUM',
    assignee: 'sam',
    reporter: 'priya',
    due: 9,
  },
  {
    title: 'Create Open Graph images for key pages',
    status: 'TODO',
    priority: 'LOW',
    reporter: 'jordan',
  },
  {
    title: 'Write 301 redirects for old URLs',
    status: 'TODO',
    priority: 'HIGH',
    assignee: 'alex',
    reporter: 'priya',
    due: 12,
    description: 'Export the old sitemap first so nothing indexed by search engines is lost.',
  },
  {
    title: 'Run a Lighthouse pass on mobile',
    status: 'TODO',
    priority: 'MEDIUM',
    reporter: 'sam',
    due: 14,
  },
  {
    title: 'Plan the launch announcement',
    status: 'TODO',
    priority: 'LOW',
    assignee: 'priya',
    reporter: 'alex',
    due: 20,
  },
  {
    title: 'Accessibility review with a screen reader',
    status: 'TODO',
    priority: 'URGENT',
    assignee: 'jordan',
    reporter: 'priya',
    due: 7,
  },
];

function daysFromToday(days: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

/** Evenly spaced fractional-indexing keys per status, in the order tasks appear in TASKS. */
function assignRanks(tasks: SeedTask[]): string[] {
  const keysByStatus = new Map<TaskStatus, string[]>();
  for (const status of new Set(tasks.map((task) => task.status))) {
    const count = tasks.filter((task) => task.status === status).length;
    keysByStatus.set(status, generateNKeysBetween(null, null, count));
  }
  return tasks.map((task) => {
    const rank = keysByStatus.get(task.status)?.shift();
    if (!rank) throw new Error(`Ran out of ranks for ${task.status}`);
    return rank;
  });
}

async function main() {
  // Hashed up front (one salt per user) so the slow work stays outside the transaction.
  const passwordHashes = await Promise.all(USERS.map(() => hashPassword(DEMO_PASSWORD)));
  const ranks = assignRanks(TASKS);

  const summary = await prisma.$transaction(async (tx) => {
    const userIds = {} as Record<UserKey, string>;
    for (const [index, { key, name, email }] of USERS.entries()) {
      const passwordHash = passwordHashes[index]!;
      const user = await tx.user.upsert({
        where: { email },
        update: { name, passwordHash },
        create: { name, email, passwordHash },
      });
      userIds[key] = user.id;
    }

    // Cascades to members, projects, tasks and comments.
    await tx.workspace.deleteMany({ where: { slug: 'acme' } });

    const workspace = await tx.workspace.create({
      data: {
        name: 'Acme Studio',
        slug: 'acme',
        createdById: userIds.alex,
        members: { create: USERS.map(({ key, role }) => ({ userId: userIds[key], role })) },
      },
    });

    const project = await tx.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Website Relaunch',
        key: 'WEB',
        description: 'Redesign and rebuild acme.studio before the spring campaign.',
        color: '#6366F1',
        nextTaskNumber: TASKS.length + 1,
        createdById: userIds.alex,
      },
    });

    for (const [index, task] of TASKS.entries()) {
      await tx.task.create({
        data: {
          projectId: project.id,
          number: index + 1,
          title: task.title,
          description: task.description ?? null,
          status: task.status,
          priority: task.priority,
          rank: ranks[index]!,
          assigneeId: task.assignee ? userIds[task.assignee] : null,
          reporterId: userIds[task.reporter],
          dueDate: task.due === undefined ? null : daysFromToday(task.due),
          completedAt: task.status === 'DONE' ? daysFromToday(-3) : null,
          comments: {
            create: (task.comments ?? []).map(({ author, body }) => ({
              authorId: userIds[author],
              body,
            })),
          },
        },
      });
    }

    return { workspace: workspace.slug, project: project.key, tasks: TASKS.length };
  });

  logger.info(
    {
      ...summary,
      users: USERS.map((user) => user.email),
      password: process.env.SEED_DEMO_PASSWORD ? '(from SEED_DEMO_PASSWORD)' : DEMO_PASSWORD,
    },
    'Seeded demo data',
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
