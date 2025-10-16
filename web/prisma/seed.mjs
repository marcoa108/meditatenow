// @ts-check
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Invitation codes (idempotent)
  await prisma.invitationCode.upsert({
    where: { code: 'WELCOME-ANY' },
    update: {},
    create: { code: 'WELCOME-ANY', maxLevel: 'advanced', active: true },
  })
  await prisma.invitationCode.upsert({
    where: { code: 'BEGINNER-ONLY' },
    update: {},
    create: { code: 'BEGINNER-ONLY', maxLevel: 'beginner', active: true },
  })

  // Tags
  await prisma.$transaction([
    prisma.tag.upsert({ where: { name: 'Wellness' }, update: {}, create: { name: 'Wellness' } }),
    prisma.tag.upsert({ where: { name: 'Depth' }, update: {}, create: { name: 'Depth' } }),
    prisma.tag.upsert({ where: { name: 'Kundalini' }, update: {}, create: { name: 'Kundalini' } }),
    prisma.tag.upsert({ where: { name: 'Muladhara' }, update: {}, create: { name: 'Muladhara' } }),
  ])

  const intro = await prisma.clip.upsert({
    where: { id: 'intro_en_1' },
    update: {},
    create: {
      id: 'intro_en_1',
      type: 'intro',
      number: 1,
      speaker: 'Marco',
      language: 'en',
      durationSec: 20,
      silenceMultiplier: 100,
      minLevel: 'beginner',
      maxLevel: 'advanced',
      commonPosition: 10,
    },
  })

  const selfRealization = await prisma.clip.upsert({
    where: { id: 'self_realization_en_1' },
    update: {},
    create: {
      id: 'self_realization_en_1',
      type: 'first_meditation',
      number: 1,
      speaker: 'Marco',
      language: 'en',
      durationSec: 300,
      silenceMultiplier: 100,
      minLevel: 'beginner',
      maxLevel: 'beginner',
      commonPosition: 20,
    },
  })

  await prisma.clip.upsert({
    where: { id: 'outro_en_1' },
    update: {},
    create: {
      id: 'outro_en_1',
      type: 'outro',
      number: 1,
      speaker: 'Marco',
      language: 'en',
      durationSec: 15,
      silenceMultiplier: 100,
      minLevel: 'beginner',
      maxLevel: 'advanced',
      commonPosition: 90,
    },
  })

  await prisma.clipVariant.upsert({
    where: { id: 'v_intro_1' },
    update: {},
    create: {
      id: 'v_intro_1',
      clipId: intro.id,
      variantNo: 1,
      audioUrl: null,
      subtitlesUrl: null,
    },
  })

  await prisma.clipVariant.upsert({
    where: { id: 'v_sr_1' },
    update: {},
    create: {
      id: 'v_sr_1',
      clipId: selfRealization.id,
      variantNo: 1,
      audioUrl: null,
      subtitlesUrl: null,
    },
  })

  await prisma.clipVariant.upsert({
    where: { id: 'v_outro_1' },
    update: {},
    create: {
      id: 'v_outro_1',
      clipId: 'outro_en_1',
      variantNo: 1,
      audioUrl: null,
      subtitlesUrl: null,
    },
  })

  console.log('Seeded invitation codes, tags, and mock clips/variants')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
