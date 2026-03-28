ALTER TABLE "notifications" ADD COLUMN "request_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_request_id_platform_access_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."platform_access_requests"("id") ON DELETE cascade ON UPDATE no action;