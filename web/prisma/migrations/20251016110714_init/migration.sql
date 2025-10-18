-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "dob" DATETIME,
    "country" TEXT,
    "username" TEXT,
    "appLanguage" TEXT NOT NULL DEFAULT 'en',
    "meditationLanguage" TEXT NOT NULL DEFAULT 'en',
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "notifyInteresting" BOOLEAN NOT NULL DEFAULT false,
    "notifyReminders" BOOLEAN NOT NULL DEFAULT false,
    "reminderSchedule" TEXT,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvitationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "maxLevel" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "speaker" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "silenceMultiplier" INTEGER NOT NULL DEFAULT 100,
    "minLevel" TEXT NOT NULL DEFAULT 'basic',
    "maxLevel" TEXT NOT NULL DEFAULT 'advanced',
    "commonPosition" INTEGER,
    "includesMovement" BOOLEAN NOT NULL DEFAULT false,
    "speakerGender" INTEGER,
    "linkedTalkUrl" TEXT,
    "fullMeditation" BOOLEAN NOT NULL DEFAULT false,
    "mandatoryNextId" TEXT,
    "mandatoryPrevId" TEXT,
    CONSTRAINT "Clip_mandatoryNextId_fkey" FOREIGN KEY ("mandatoryNextId") REFERENCES "Clip" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Clip_mandatoryPrevId_fkey" FOREIGN KEY ("mandatoryPrevId") REFERENCES "Clip" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClipVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clipId" TEXT NOT NULL,
    "variantNo" INTEGER NOT NULL DEFAULT 1,
    "audioUrl" TEXT,
    "subtitlesUrl" TEXT,
    CONSTRAINT "ClipVariant_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariantTag" (
    "clipVariantId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("clipVariantId", "tagId"),
    CONSTRAINT "VariantTag_clipVariantId_fkey" FOREIGN KEY ("clipVariantId") REFERENCES "ClipVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariantTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meditation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "totalDurationSec" INTEGER NOT NULL,
    CONSTRAINT "Meditation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeditationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meditationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "clipVariantId" TEXT,
    "isSilence" BOOLEAN NOT NULL DEFAULT false,
    "durationSec" INTEGER NOT NULL,
    CONSTRAINT "MeditationItem_meditationId_fkey" FOREIGN KEY ("meditationId") REFERENCES "Meditation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MeditationItem_clipVariantId_fkey" FOREIGN KEY ("clipVariantId") REFERENCES "ClipVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeditationSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "meditationId" TEXT NOT NULL,
    "requestedParams" TEXT NOT NULL,
    "sequence" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "playedSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeditationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MeditationSession_meditationId_fkey" FOREIGN KEY ("meditationId") REFERENCES "Meditation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_ProfileTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProfileTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProfileTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_code_key" ON "InvitationCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_ProfileTags_AB_unique" ON "_ProfileTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfileTags_B_index" ON "_ProfileTags"("B");
