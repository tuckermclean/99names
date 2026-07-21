#!/usr/bin/env node
/**
 * Fetches the dev-placeholder per-name recitation clips into
 * src/assets/audio/. These binaries are intentionally NOT committed to this
 * (public) repo — see src/assets/audio/AUDIO_PLACEHOLDERS_NOTICE.md.
 *
 * Source: https://github.com/ProgrammerHasan/99-names-of-allah-audios
 * (unlicensed, reciter unknown; dev-only, not for distribution — do not
 * ship these to end users or app stores).
 *
 * Usage: npm run fetch-audio
 *
 * Plain Node (uses global fetch, Node >= 18). No extra dependencies.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'audio');

const RAW_BASE =
  'https://raw.githubusercontent.com/ProgrammerHasan/99-names-of-allah-audios/main/';

/**
 * Maps this project's corpus `id` -> the exact filename in the source repo.
 * Most filenames match the corpus id directly (e.g. `ar_rahman.mp3` comes
 * from `01_ar_rahman.mp3`); a handful of source filenames have typos or
 * reused slugs relative to their position in the traditional 99-name list,
 * so those are cross-mapped explicitly (see AUDIO_PLACEHOLDERS_NOTICE.md
 * for the full explanation of each exception).
 *
 * 4 corpus ids have no matching clip in the source repo and are skipped:
 * `allah`, `al_qarib`, `ar_rabb`, `al_fatir` (they fall back to
 * placeholder.wav, which IS committed to the repo).
 */
const ID_TO_SOURCE_FILE = {
  ar_rahman: '01_ar_rahman.mp3',
  ar_rahim: '02_ar_rahim.mp3',
  al_malik: '03_al_malik.mp3',
  al_quddus: '04_al_quddus.mp3',
  as_salam: '05_as_salam.mp3',
  al_mumin: '06_al_mumin.mp3',
  al_muhaymin: '07_al_muhaymin.mp3',
  al_aziz: '08_al_aziz.mp3',
  al_jabbar: '09_al_jabbar.mp3',
  al_mutakabbir: '10_al_mutakabbir.mp3',
  al_khaliq: '11_al_khaliq.mp3',
  al_bari: '12_al_bari.mp3',
  al_musawwir: '13_al_musawwir.mp3',
  al_ghaffar: '14_al_ghaffar.mp3',
  al_qahhar: '15_al_qahhar.mp3',
  al_wahhab: '16_al_wahhab.mp3',
  ar_razzaq: '17_ar_razzaq.mp3',
  al_fattah: '18_al_fattah.mp3',
  al_alim: '19_al_alim.mp3',
  al_qabid: '20_al_qabid.mp3',
  al_basit: '21_al_basit.mp3',
  al_khafid: '22_al_khafid.mp3',
  ar_rafi: '23_ar_rafi.mp3',
  al_muizz: 'audio24_24_al_muizz.mp3',
  al_mudhill: 'audio25_25_al_mudhill.mp3',
  as_sami: 'audio26_26_as_sami.mp3',
  al_basir: 'audio27_27_al_basir.mp3',
  al_hakam: 'audio28_28_al_hakam.mp3',
  al_adl: 'audio29_29_al_adl.mp3',
  al_latif: 'audio30_30_al_latif.mp3',
  al_khabir: 'audio31_31_al_khabir.mp3',
  al_halim: 'audio32_32_al_halim.mp3',
  al_azim: 'audio33_33_al_azim.mp3',
  al_ghafur: 'audio34_34_al_ghafur.mp3',
  ash_shakur: 'audio35_35_ash_shakur.mp3',
  al_ali: 'audio36_36_al_ali.mp3',
  al_kabir: 'audio37_37_al_kabir.mp3',
  al_hafiz: 'audio38_38_al_hafiz.mp3',
  al_muqit: 'audio39_39_al_muqit.mp3',
  al_hasib: 'audio40_40_al_hasib.mp3',
  al_jalil: 'audio41_41_al_jalil.mp3',
  al_karim: 'audio42_42_al_karim.mp3',
  ar_raqib: 'audio43_43_ar_raqib.mp3',
  al_mujib: 'audio44_44_al_mujib.mp3',
  al_wasi: 'audio45_45_al_wasi.mp3',
  al_hakim: 'audio46_46_al_hakim.mp3',
  al_wadud: 'audio47_47_al_wadud.mp3',
  al_majid: 'audio48_48_al_majid.mp3',
  // source filename typo ("al_bayes") for Al-Ba'ith
  al_baith: 'audio49_49_al_bayes.mp3',
  ash_shahid: 'audio50_50_ash_shahid.mp3',
  al_haqq: 'audio51_51_al_haqq.mp3',
  al_wakil: 'audio52_52_al_wakil.mp3',
  al_qawi: 'audio53_53_al_qawi.mp3',
  al_matin: 'audio54_54_al_matin.mp3',
  al_wali: 'audio55_55_al_wali.mp3',
  al_hamid: 'audio56_56_al_hamid.mp3',
  al_muhsi: 'audio57_57_al_muhsi.mp3',
  al_mubdi: 'audio58_58_al_mubdi.mp3',
  al_muid: 'audio59_59_al_muid.mp3',
  al_muhyi: 'audio60_60_al_muhyi.mp3',
  al_mumit: 'audio61_61_al_mumit.mp3',
  al_hayy: 'audio62_62_al_hayy.mp3',
  al_qayyum: 'audio63_63_al_qayyum.mp3',
  al_wajid: 'audio64_64_al_wajid.mp3',
  // source's `al_majid` slug is reused/duplicated at this position; corpus's
  // `al_majd` entry also transliterates "Al-Majid"
  al_majd: 'audio65_65_al_majid.mp3',
  al_wahid: 'audio66_66_al_wahid.mp3',
  // bonus match: one of the corpus's 4 "Further Names", not one of the
  // standard 99, but the source repo's numbering happened to include it
  al_ahad: 'audio67_67_al_ahad.mp3',
  as_samad: 'audio68_68_as_samad.mp3',
  al_qadir: 'audio69_69_al_qadir.mp3',
  al_muqtadir: 'audio70_70_al_muqtadir.mp3',
  al_muqaddim: 'audio71_71_al_muqaddim.mp3',
  al_muakhkhir: 'audio72_72_al_muakhkhir.mp3',
  al_awwal: 'audio73_73_al_awwal.mp3',
  al_akhir: 'audio74_74_al_akhir.mp3',
  az_zahir: 'audio75_75_az_zahir.mp3',
  al_batin: 'audio76_76_al_batin.mp3',
  // corpus's second "Al-Wali" entry (The Governing Protector variant)
  al_wali_gov: 'audio77_77_al_wali.mp3',
  al_mutaali: 'audio78_78_al_mutaali.mp3',
  al_barr: 'audio79_79_al_barr.mp3',
  at_tawwab: 'audio80_80_at_tawwab.mp3',
  al_muntaqim: 'audio81_81_al_muntaqim.mp3',
  al_afuw: 'audio82_82_al_afuw.mp3',
  ar_rauf: 'audio83_83_ar_rauf.mp3',
  // spelling variant ("ul" vs "al")
  malik_al_mulk: 'audio84_84_malik_ul_mulk.mp3',
  // longer transliteration variant of the same name
  dhul_jalal: 'audio85_85_dhul_jalaal_wal_ikraam.mp3',
  al_muqsit: 'audio86_86_al_muqsit.mp3',
  // spelling variant ("jame" vs "jami")
  al_jami: 'audio87_87_al_jame.mp3',
  al_ghani: 'audio88_88_al_ghani.mp3',
  al_mughni: 'audio89_89_al_mughni.mp3',
  al_mani: 'audio90_90_al_mani.mp3',
  ad_darr: 'audio91_91_ad_darr.mp3',
  an_nafi: 'audio92_92_an_nafi.mp3',
  an_nur: 'audio93_93_an_nur.mp3',
  al_hadi: 'audio94_94_al_hadi.mp3',
  al_badi: 'audio95_95_al_badi.mp3',
  al_baqi: 'audio96_96_al_baqi.mp3',
  al_warith: 'audio97_97_al_warith.mp3',
  ar_rashid: 'audio98_98_ar_rashid.mp3',
  as_sabur: 'audio99_99_as_sabur.mp3',
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const ids = Object.keys(ID_TO_SOURCE_FILE);
  console.log(`Fetching ${ids.length} dev-placeholder audio clips...`);

  let ok = 0;
  let failed = 0;

  for (const id of ids) {
    const sourceFile = ID_TO_SOURCE_FILE[id];
    const destPath = path.join(OUT_DIR, `${id}.mp3`);

    if (existsSync(destPath)) {
      console.log(`  skip (already present): ${id}.mp3`);
      ok += 1;
      continue;
    }

    const url = RAW_BASE + encodeURIComponent(sourceFile).replace(/%2F/g, '/');
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(destPath, buf);
      console.log(`  ok: ${sourceFile} -> ${id}.mp3`);
      ok += 1;
    } catch (err) {
      console.error(`  FAILED: ${sourceFile} -> ${id}.mp3 (${err.message})`);
      failed += 1;
    }
  }

  console.log(`\nDone. ${ok} succeeded, ${failed} failed.`);
  if (failed > 0) {
    console.error(
      'Some clips failed to download. audioManifest.ts requires() each of ' +
        'these files by path, so a missing file will fail Metro bundling — ' +
        're-run this script (or check your network connection) before ' +
        'building the app.'
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
