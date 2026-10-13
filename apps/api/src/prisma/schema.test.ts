import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from './client.js';

// Each run uses its own users and workspace, so it never collides with other test files.
const runId = randomUUID().slice(0, 8);
const email = (name: string) => `${name}-${runId}@schema.test`;

let ownerId: string;
let otherId: string;
let workspaceId: string;
let projectId: string;

async function createTask(data: { number: number; rank: string; status?: 'TODO' | 'DONE' }) {
  return prisma.task.create({
    data: {
      projectId,
      reporterId: ownerId,
      title: `Task ${data.number}`,
      completedAt: data.status === 'DONE' ? new Date() : null,
      ...data,
    },
  });
}

beforeAll(async () => {
  const [owner, other] = await Promise.all([
    prisma.user.create({ data: { email: email('owner'), name: 'Owner', passwordHash: 'x' } }),
    prisma.user.create({ data: { email: email('other'), name: 'Other', passwordHash: 'x' } }),
  ]);
  ownerId = owner.id;
  otherId = other.id;

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Schema test',
      slug: `schema-test-${runId}`,
      createdById: ownerId,
      members: { create: { userId: ownerId, role: 'OWNER' } },
    },
  });
  workspaceId = workspace.id;

  const project = await prisma.project.create({
    data: { workspaceId, name: 'Schema', key: 'SCH', createdById: ownerId },
  });
  projectId = project.id;
});

afterAll(async () => {
  await prisma.workspace.deleteMany({ where: { id: workspaceId } });
  await prisma.user.deleteMany({ where: { id: { in: [ownerId, otherId] } } });
  await prisma.$disconnect();
});

describe('database schema', () => {
  it('applies defaults for new tasks', async () => {
    const task = await createTask({ number: 1, rank: 'a0' });

    expect(task).toMatchObject({ status: 'TODO', priority: 'MEDIUM', version: 1 });
    expect(task.id).toMatch(/^[0-9a-f-]{8}-[0-9a-f]{4}-7/);
  });

  it('keeps task numbers unique per project', async () => {
    await createTask({ number: 2, rank: 'a1' });

    await expect(createTask({ number: 2, rank: 'a2' })).rejects.toMatchObject({ code: 'P2002' });
  });

  it('keeps workspace memberships and project keys unique', async () => {
    await expect(
      prisma.workspaceMember.create({ data: { workspaceId, userId: ownerId, role: 'ADMIN' } }),
    ).rejects.toMatchObject({ code: 'P2002' });
    await expect(
      prisma.project.create({
        data: { workspaceId, name: 'Duplicate', key: 'SCH', createdById: ownerId },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('orders ranks byte-wise, the way fractional-indexing compares keys', async () => {
    // Under a locale collation "a" sorts before "Z"; byte-wise, every uppercase letter comes first.
    await createTask({ number: 10, rank: 'Zz' });
    await createTask({ number: 11, rank: 'b0' });

    const ranks = await prisma.task.findMany({
      where: { projectId, number: { in: [1, 2, 10, 11] } },
      orderBy: { rank: 'asc' },
      select: { rank: true },
    });

    expect(ranks.map((t) => t.rank)).toEqual(['Zz', 'a0', 'a1', 'b0']);
  });

  it('rejects rows that break check constraints', async () => {
    await expect(
      prisma.user.create({
        data: { email: `Mixed-${runId}@Schema.test`, name: 'x', passwordHash: 'x' },
      }),
    ).rejects.toThrow(/users_email_lowercase_check/);
    await expect(
      prisma.project.create({
        data: { workspaceId, name: 'Bad', key: 'web', createdById: ownerId },
      }),
    ).rejects.toThrow(/projects_key_format_check/);
    await expect(
      prisma.task.create({
        data: {
          projectId,
          reporterId: ownerId,
          title: 'x',
          number: 20,
          rank: 'c0',
          status: 'DONE',
        },
      }),
    ).rejects.toThrow(/tasks_completed_at_matches_status_check/);
  });

  it('refuses to delete a user who still owns workspace data', async () => {
    await expect(prisma.user.delete({ where: { id: ownerId } })).rejects.toMatchObject({
      code: 'P2003',
    });
    expect(await prisma.task.count({ where: { projectId } })).toBeGreaterThan(0);
  });

  it('deletes a user’s sessions with the user', async () => {
    const user = await prisma.user.create({
      data: {
        email: email('sessions'),
        name: 'Sessions',
        passwordHash: 'x',
        sessions: {
          create: { tokenHash: `hash-${runId}`, expiresAt: new Date(Date.now() + 60_000) },
        },
      },
    });

    await prisma.user.delete({ where: { id: user.id } });

    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it('cascades a workspace delete down to projects, tasks and comments', async () => {
    const workspace = await prisma.workspace.create({
      data: { name: 'Doomed', slug: `doomed-${runId}`, createdById: ownerId },
    });
    const project = await prisma.project.create({
      data: { workspaceId: workspace.id, name: 'Doomed', key: 'DOOM', createdById: ownerId },
    });
    const task = await prisma.task.create({
      data: {
        projectId: project.id,
        reporterId: ownerId,
        number: 1,
        title: 'Doomed',
        rank: 'a0',
        comments: { create: { authorId: otherId, body: 'Bye' } },
      },
    });

    await prisma.workspace.delete({ where: { id: workspace.id } });

    expect(await prisma.project.count({ where: { id: project.id } })).toBe(0);
    expect(await prisma.task.count({ where: { id: task.id } })).toBe(0);
    expect(await prisma.taskComment.count({ where: { taskId: task.id } })).toBe(0);
  });
});
