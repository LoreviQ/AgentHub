import { z } from "zod";

const permissionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(8),
  risk: z.enum(["low", "medium", "high"]),
  required: z.boolean(),
});

export const publishAgentSchema = z.object({
  name: z.string().min(3),
  tagline: z.string().min(8),
  description: z.string().min(20),
  categories: z.array(z.string()).min(1),
  capabilities: z.array(z.string()).min(1),
  permissions: z.array(permissionSchema).min(1),
  priceModel: z.enum(["per_run", "subscription", "usage"]),
  price: z.number().positive(),
  owner: z.string().min(2),
  packageVersion: z.string().min(3),
  entryPoint: z.string().min(3),
  runtime: z.string().min(2),
});

export const invokeAgentSchema = z.object({
  agentId: z.string().min(1),
  input: z.string().min(3),
  approvedPermissionIds: z.array(z.string()).min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});
