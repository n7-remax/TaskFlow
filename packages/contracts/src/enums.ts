import { z } from 'zod';

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;
export const TaskStatusSchema = z.enum(TASK_STATUSES);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export const TaskStatus = TaskStatusSchema.enum;

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const PrioritySchema = z.enum(PRIORITIES);
export type Priority = z.infer<typeof PrioritySchema>;
export const Priority = PrioritySchema.enum;

/** Ordered from most to least privileged. */
export const ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const;
export const RoleSchema = z.enum(ROLES);
export type Role = z.infer<typeof RoleSchema>;
export const Role = RoleSchema.enum;
