CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"action" text NOT NULL,
	"admin_name" text DEFAULT 'Admin' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
