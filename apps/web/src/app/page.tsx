import { GripVertical, KanbanSquare, ShieldCheck, Users } from 'lucide-react';

import { ApiStatus } from '@/components/api-status';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  {
    icon: KanbanSquare,
    title: 'Kanban boards',
    description:
      'Projects with To do, In progress, In review and Done columns, and ids like WEB-42.',
  },
  {
    icon: GripVertical,
    title: 'Drag and drop that feels instant',
    description:
      'Optimistic moves with rollback, fractional ranks and version checks on every task.',
  },
  {
    icon: Users,
    title: 'Workspaces and roles',
    description:
      'Invite teammates as owners, admins or members. Every permission is enforced by the API.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    description:
      'HttpOnly session cookies, argon2id passwords and one validated contract for API and UI.',
  },
];

const COLUMNS = [
  { name: 'To do', cards: ['Draft onboarding copy', 'Audit color tokens'] },
  { name: 'In progress', cards: ['Board drag and drop'] },
  { name: 'In review', cards: ['Session middleware'] },
  { name: 'Done', cards: ['Monorepo foundation'] },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <KanbanSquare className="size-4" aria-hidden />
          </span>
          TaskFlow
        </div>
        <Badge variant="outline">In development</Badge>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 pt-10 pb-20 md:pt-20">
        <section className="flex flex-col items-start gap-6">
          <ApiStatus />
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Plan, track and ship work on one shared board.
          </h1>
          <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
            TaskFlow is a Trello-style project manager for small teams, built with Next.js, Redux
            Toolkit, Express and PostgreSQL. Sign-up and boards are on the way. For now this page
            checks that the stack is wired up end to end.
          </p>
        </section>

        <section aria-label="Board preview" className="-mx-6 overflow-x-auto px-6">
          <div className="grid min-w-[720px] grid-cols-4 gap-3 rounded-xl border bg-muted/40 p-3">
            {COLUMNS.map((column) => (
              <div key={column.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1 text-xs font-medium text-muted-foreground uppercase">
                  {column.name}
                  <span>{column.cards.length}</span>
                </div>
                {column.cards.map((card) => (
                  <div key={card} className="rounded-lg border bg-background p-3 text-sm shadow-xs">
                    {card}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-2">
              <Icon className="size-5 text-primary" aria-hidden />
              <h2 className="font-medium">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-sm text-muted-foreground">
          A portfolio project by Max Vinn.
        </div>
      </footer>
    </div>
  );
}
