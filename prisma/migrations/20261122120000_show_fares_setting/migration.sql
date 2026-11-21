-- Taxi fare estimates on public pages are hidden unless switched on in Admin -> Settings
ALTER TABLE "SiteSettings" ADD COLUMN "showFares" BOOLEAN NOT NULL DEFAULT false;
