import { PrismaClient, Level, Language } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Invitation codes (free text + max level)
  await prisma.invitationCode.createMany({
    data: [
      { code: 'WELCOME-ANY', maxLevel: 'advanced', active: true },
      { code: 'BEGINNER-ONLY', maxLevel: 'beginner', active: true },
    ] as any,
    skipDuplicates: true,
  });

  // Tags
  const tags = await prisma.([
    prisma.tag.upsert({ where: { name: 'Wellness' }, update: {}, create: { name: 'Wellness' } }),
    prisma.tag.upsert({ where: { name: 'Depth' }, update: {}, create: { name: 'Depth' } }),
    prisma.tag.upsert({ where: { name: 'Kundalini' }, update: {}, create: { name: 'Kundalini' } }),
    prisma.tag.upsert({ where: { name: 'Muladhara' }, update: {}, create: { name: 'Muladhara' } }),
  ]);

  // Clips (mock)
  const intro = await prisma.clip.upsert({
    where: { id: 'intro_en_1' },
    update: {},
    create: {
      id: 'intro_en_1',
      type: 'intro',
      number: 1,
      speaker: 'Marco',
      language: 'en' as any,
      durationSec: 20,
      silenceMultiplier: 100,
      minLevel: 'beginner' as any,
      maxLevel: 'advanced' as any,
      commonPosition: 10,
    },
  });

  const selfRealization = await prisma.clip.upsert({
    where: { id: 'self_realization_en_1' },
    update: {},
    create: {
      id: 'self_realization_en_1',
      type: 'first_meditation',
      number: 1,
      speaker: 'Marco',
      language: 'en' as any,
      durationSec: 300,
      silenceMultiplier: 100,
      minLevel: 'beginner' as any,
      maxLevel: 'beginner' as any,
      commonPosition: 20,
    },
  });

  const outro = await prisma.clip.upsert({
    where: { id: 'outro_en_1' },
    update: {},
    create: {
      id: 'outro_en_1',
      type: 'outro',
      number: 1,
      speaker: 'Marco',
      language: 'en' as any,
      durationSec: 15,
      silenceMultiplier: 100,
      minLevel: 'beginner' as any,
      maxLevel: 'advanced' as any,
      commonPosition: 90,
    },
  });

  // Variants
  const vIntro = await prisma.clipVariant.upsert({
    where: { id: 'v_intro_1' },
    update: {},
    create: {
      id: 'v_intro_1',
      clipId: intro.id,
      variantNo: 1,
      audioUrl: null,
      subtitlesUrl: null,
    },
  });

  const vSR = await prisma.clipVariant.upsert({
    where: { id: 'v_sr_1' },
    update: {},
    create: {
      id: 'v_sr_1',
      clipId: selfRealization.id,
      variantNo: 1,
      audioUrl: null,
      subtitlesUrl: null,
    },
  });

  const vOutro = await prisma.clipVariant.upsert({
    where: { id: 'v_outro_1' },
    update: {},
    create: {
      id: 'v_outro_1',
      clipId: outro.id,
      variantNo: 1,
      audioUrl: null,
      subtitlesUrl: null,
    },
  });

  console.log('Seeded invitation codes, tags, and mock clips/variants');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.();
});
