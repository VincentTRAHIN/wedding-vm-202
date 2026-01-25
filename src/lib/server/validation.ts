import { z } from 'zod';

/**
 * Validation schemas for server-side input validation
 */

// Email validation
export const emailSchema = z.string().email('Email invalide').toLowerCase().trim();

// Password validation (min 8 chars, at least 1 number)
export const passwordSchema = z
	.string()
	.min(8, 'Le mot de passe doit contenir au moins 8 caractères')
	.regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

// Guest name validation
export const guestNameSchema = z
	.string()
	.min(2, 'Le nom doit contenir au moins 2 caractères')
	.max(100, 'Le nom est trop long')
	.trim();

// RSVP Status
export const rsvpStatusSchema = z.enum(['present', 'absent', 'pending']);

// Dietary restrictions
export const dietaryRestrictionsSchema = z
	.string()
	.max(500, 'Le texte est trop long')
	.trim()
	.optional();

// Photo caption
export const photoCaptionSchema = z
	.string()
	.max(500, 'La légende est trop longue')
	.trim()
	.optional();

// Comment content
export const commentContentSchema = z
	.string()
	.min(1, 'Le commentaire ne peut pas être vide')
	.max(1000, 'Le commentaire est trop long')
	.trim();

// Song request
export const songRequestSchema = z.object({
	track_name: z.string().min(1, 'Le titre est requis').max(200).trim(),
	artist: z.string().max(200).trim().optional()
});

// Full RSVP Update Schema
export const rsvpUpdateSchema = z.object({
	rsvp_status: rsvpStatusSchema,
	dietary_restrictions: dietaryRestrictionsSchema
});

// Invitation code
export const invitationCodeSchema = z.string().length(6, 'Code invalide').toUpperCase();

/**
 * Sanitize HTML to prevent XSS
 * Simple sanitizer - for production, consider using DOMPurify or similar
 */
export function sanitizeHtml(dirty: string): string {
	return dirty
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
}

/**
 * Validate file upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

	if (!file || file.size === 0) {
		return { valid: false, error: 'Aucun fichier fourni' };
	}

	if (file.size > MAX_FILE_SIZE) {
		return { valid: false, error: 'Fichier trop volumineux (max 10MB)' };
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return { valid: false, error: 'Type de fichier non autorisé. Seulement les images.' };
	}

	return { valid: true };
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 *
 * Strategy:
 * - For authenticated users (RSVP, UPLOAD): use userId to avoid blocking everyone on shared Wi-Fi
 * - For anonymous users (LOGIN, REGISTER): use IP address
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
	key: string,
	maxRequests: number = 10,
	windowMs: number = 60000,
	userId?: string // Optional: if provided, uses userId as key instead of IP
): { allowed: boolean; remaining: number } {
	const now = Date.now();

	// Use userId as key if provided (authenticated users), otherwise use the provided key (IP)
	const rateLimitKey = userId ? `user:${userId}:${key.split(':')[0]}` : key;

	const record = rateLimitStore.get(rateLimitKey);

	if (!record || now > record.resetAt) {
		// New window
		rateLimitStore.set(rateLimitKey, { count: 1, resetAt: now + windowMs });
		return { allowed: true, remaining: maxRequests - 1 };
	}

	if (record.count >= maxRequests) {
		return { allowed: false, remaining: 0 };
	}

	record.count++;
	rateLimitStore.set(rateLimitKey, record);
	return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Clean up old rate limit records periodically
 */
if (typeof setInterval !== 'undefined') {
	setInterval(
		() => {
			const now = Date.now();
			for (const [key, value] of rateLimitStore.entries()) {
				if (now > value.resetAt) {
					rateLimitStore.delete(key);
				}
			}
		},
		5 * 60 * 1000
	); // Every 5 minutes
}
