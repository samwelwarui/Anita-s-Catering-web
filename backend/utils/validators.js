const { z } = require('zod');
const clean = (v) => typeof v === 'string' ? v.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, 3000) : v;
const requiredText = (max=300) => z.string().transform(clean).pipe(z.string().min(1).max(max));
const eventTypes = ['Wedding','Corporate Event','Birthday / Private Party','Other'];
const reviewEventTypes = ['Wedding','Corporate','Birthday','Private Party','Other'];
const inquirySchema = z.object({
 fullName: requiredText(120), phone: requiredText(40).refine(v => /^[+()\d\s.-]{7,40}$/.test(v) && v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
 email: z.string().transform(clean).pipe(z.string().email().max(254)),
 eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d=new Date(v+'T00:00:00Z'); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10)===v && v>=new Date().toISOString().slice(0,10); }, 'Enter a valid date today or later'),
 eventTime: requiredText(20), venue: requiredText(250), eventType: z.enum(eventTypes),
 guestCount: z.coerce.number().int().min(1).max(100000), serviceStyle: z.enum(['Buffet','Plated Service','Drop-off Platters']),
 menuSelection: requiredText(1500), dietaryRestrictions: z.string().optional().transform(v=>clean(v||'')),
 allergies: z.string().optional().transform(v=>clean(v||'')), budget: z.string().optional().transform(v=>clean(v||'').slice(0,100)),
 notes: z.string().optional().transform(v=>clean(v||''))
});
const reviewSchema = z.object({ customerName: requiredText(100), email: z.union([z.literal(''), z.string().email().max(254)]).optional().default(''),
 eventType: z.enum(reviewEventTypes), rating: z.coerce.number().int().min(1).max(5), message: requiredText(1500) });
module.exports = { inquirySchema, reviewSchema, clean };
