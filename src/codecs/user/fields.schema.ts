import { z } from "zod";
import { Role, UpdateRole } from "../../enums/role.enum";

export const firstnameSchema = z
	.string()
	.nonempty("Firstname is required")
	.min(2, "Firstname must be at least 2 characters")
	.max(50, "Firstname cannot exceed 50 characters")
	.refine(
		(val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(val),
		"Firstname can only contain letters, no spaces allowed",
	)
	.transform((val) => val.toLowerCase());

export const lastnameSchema = z
	.string()
	.nonempty("Lastname is required")
	.min(2, "Lastname must be at least 2 characters")
	.max(50, "Lastname cannot exceed 50 characters")
	.refine(
		(val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(val),
		"Lastname can only contain letters, no spaces allowed",
	)
	.transform((val) => val.toLowerCase());

export const usernameSchema = z
	.string()
	.nonempty("Username is required")
	.min(3, "Username must be at least 3 characters")
	.max(30, "Username cannot exceed 30 characters")
	.refine(
		(val) => /^[a-zA-Z0-9_]+$/.test(val),
		"Username can only contain letters, numbers and underscores, no spaces allowed",
	)
	.transform((val) => val.toLowerCase());

export const roleSchema = z.enum(Role);

export const updateRoleSchema = z.enum(UpdateRole);

export const emailSchema = z
	.email("Invalid email format")
	.nonempty("Email is required")
	.max(100, "Email cannot exceed 100 characters")
	.transform((val) => val.toLowerCase());

export const passwordSchema = z
	.string()
	.nonempty("Password is required")
	.min(8, "Password must be at least 8 characters")
	.max(100, "Password cannot exceed 100 characters")
	.refine(
		(val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
		"Password must contain at least one uppercase letter, one lowercase letter, and one number",
	);

export const birthdaySchema = z
	.union([
		z.string().refine(
			(val) => {
				const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
				return isoRegex.test(val);
			},
			{
				message:
					"Invalid ISO 8601 string format. Expected: YYYY-MM-DDTHH:mm:ss.sssZ",
			},
		),
		z.date(),
	])
	.transform((val) => (typeof val === "string" ? new Date(val) : val));

export const enableSchema = z.boolean().default(true);

export const createdAtSchema = z
	.date()
	.default(() => new Date())
	.refine((date) => date <= new Date(), "Created date cannot be a future date");

export const updatedAtSchema = z
	.date()
	.default(() => new Date())
	.refine((date) => date <= new Date(), "Updated date cannot be a future date");
