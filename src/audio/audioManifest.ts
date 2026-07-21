/**
 * Bundled audio manifest — keyed by corpus name ID.
 *
 * DEV PLACEHOLDER AUDIO: 99 of 103 entries now point to real per-name
 * recitation clips collected from an unlicensed public GitHub source for
 * DEVELOPMENT PURPOSES ONLY (not for distribution). See
 * ../assets/audio/AUDIO_PLACEHOLDERS_NOTICE.md for source, reciter info
 * (unknown/unattributed), and the full per-id breakdown.
 * Before release: replace each value with a properly licensed, credited
 * per-name asset and confirm rights to bundle.
 * The audio service (player.ts) reads this map and stays unchanged.
 * SPEC §5, AGENTS.md §Audio.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PLACEHOLDER = require('../assets/audio/placeholder.wav') as number;

const manifest: Record<string, number> = {
  // "allah" is the Supreme Name itself, not one of the 99 — no matching
  // clip was found in the source repo; falls back to the silent placeholder.
  allah: PLACEHOLDER,
  ar_rahman: require('../assets/audio/ar_rahman.mp3') as number,
  ar_rahim: require('../assets/audio/ar_rahim.mp3') as number,
  al_malik: require('../assets/audio/al_malik.mp3') as number,
  al_quddus: require('../assets/audio/al_quddus.mp3') as number,
  as_salam: require('../assets/audio/as_salam.mp3') as number,
  al_mumin: require('../assets/audio/al_mumin.mp3') as number,
  al_muhaymin: require('../assets/audio/al_muhaymin.mp3') as number,
  al_aziz: require('../assets/audio/al_aziz.mp3') as number,
  al_jabbar: require('../assets/audio/al_jabbar.mp3') as number,
  al_mutakabbir: require('../assets/audio/al_mutakabbir.mp3') as number,
  al_khaliq: require('../assets/audio/al_khaliq.mp3') as number,
  al_bari: require('../assets/audio/al_bari.mp3') as number,
  al_musawwir: require('../assets/audio/al_musawwir.mp3') as number,
  al_ghaffar: require('../assets/audio/al_ghaffar.mp3') as number,
  al_qahhar: require('../assets/audio/al_qahhar.mp3') as number,
  al_wahhab: require('../assets/audio/al_wahhab.mp3') as number,
  ar_razzaq: require('../assets/audio/ar_razzaq.mp3') as number,
  al_fattah: require('../assets/audio/al_fattah.mp3') as number,
  al_alim: require('../assets/audio/al_alim.mp3') as number,
  al_qabid: require('../assets/audio/al_qabid.mp3') as number,
  al_basit: require('../assets/audio/al_basit.mp3') as number,
  al_khafid: require('../assets/audio/al_khafid.mp3') as number,
  ar_rafi: require('../assets/audio/ar_rafi.mp3') as number,
  al_muizz: require('../assets/audio/al_muizz.mp3') as number,
  al_mudhill: require('../assets/audio/al_mudhill.mp3') as number,
  as_sami: require('../assets/audio/as_sami.mp3') as number,
  al_basir: require('../assets/audio/al_basir.mp3') as number,
  al_hakam: require('../assets/audio/al_hakam.mp3') as number,
  al_adl: require('../assets/audio/al_adl.mp3') as number,
  al_latif: require('../assets/audio/al_latif.mp3') as number,
  al_khabir: require('../assets/audio/al_khabir.mp3') as number,
  al_halim: require('../assets/audio/al_halim.mp3') as number,
  al_azim: require('../assets/audio/al_azim.mp3') as number,
  al_ghafur: require('../assets/audio/al_ghafur.mp3') as number,
  ash_shakur: require('../assets/audio/ash_shakur.mp3') as number,
  al_ali: require('../assets/audio/al_ali.mp3') as number,
  al_kabir: require('../assets/audio/al_kabir.mp3') as number,
  al_hafiz: require('../assets/audio/al_hafiz.mp3') as number,
  al_muqit: require('../assets/audio/al_muqit.mp3') as number,
  al_hasib: require('../assets/audio/al_hasib.mp3') as number,
  al_jalil: require('../assets/audio/al_jalil.mp3') as number,
  al_karim: require('../assets/audio/al_karim.mp3') as number,
  ar_raqib: require('../assets/audio/ar_raqib.mp3') as number,
  al_mujib: require('../assets/audio/al_mujib.mp3') as number,
  al_wasi: require('../assets/audio/al_wasi.mp3') as number,
  al_hakim: require('../assets/audio/al_hakim.mp3') as number,
  al_wadud: require('../assets/audio/al_wadud.mp3') as number,
  al_majid: require('../assets/audio/al_majid.mp3') as number,
  al_baith: require('../assets/audio/al_baith.mp3') as number,
  ash_shahid: require('../assets/audio/ash_shahid.mp3') as number,
  al_haqq: require('../assets/audio/al_haqq.mp3') as number,
  al_wakil: require('../assets/audio/al_wakil.mp3') as number,
  al_qawi: require('../assets/audio/al_qawi.mp3') as number,
  al_matin: require('../assets/audio/al_matin.mp3') as number,
  al_wali: require('../assets/audio/al_wali.mp3') as number,
  al_hamid: require('../assets/audio/al_hamid.mp3') as number,
  al_muhsi: require('../assets/audio/al_muhsi.mp3') as number,
  al_mubdi: require('../assets/audio/al_mubdi.mp3') as number,
  al_muid: require('../assets/audio/al_muid.mp3') as number,
  al_muhyi: require('../assets/audio/al_muhyi.mp3') as number,
  al_mumit: require('../assets/audio/al_mumit.mp3') as number,
  al_hayy: require('../assets/audio/al_hayy.mp3') as number,
  al_qayyum: require('../assets/audio/al_qayyum.mp3') as number,
  al_wajid: require('../assets/audio/al_wajid.mp3') as number,
  al_majd: require('../assets/audio/al_majd.mp3') as number,
  al_wahid: require('../assets/audio/al_wahid.mp3') as number,
  as_samad: require('../assets/audio/as_samad.mp3') as number,
  al_qadir: require('../assets/audio/al_qadir.mp3') as number,
  al_muqtadir: require('../assets/audio/al_muqtadir.mp3') as number,
  al_muqaddim: require('../assets/audio/al_muqaddim.mp3') as number,
  al_muakhkhir: require('../assets/audio/al_muakhkhir.mp3') as number,
  al_awwal: require('../assets/audio/al_awwal.mp3') as number,
  al_akhir: require('../assets/audio/al_akhir.mp3') as number,
  az_zahir: require('../assets/audio/az_zahir.mp3') as number,
  al_batin: require('../assets/audio/al_batin.mp3') as number,
  al_wali_gov: require('../assets/audio/al_wali_gov.mp3') as number,
  al_mutaali: require('../assets/audio/al_mutaali.mp3') as number,
  al_barr: require('../assets/audio/al_barr.mp3') as number,
  at_tawwab: require('../assets/audio/at_tawwab.mp3') as number,
  al_muntaqim: require('../assets/audio/al_muntaqim.mp3') as number,
  al_afuw: require('../assets/audio/al_afuw.mp3') as number,
  ar_rauf: require('../assets/audio/ar_rauf.mp3') as number,
  malik_al_mulk: require('../assets/audio/malik_al_mulk.mp3') as number,
  dhul_jalal: require('../assets/audio/dhul_jalal.mp3') as number,
  al_muqsit: require('../assets/audio/al_muqsit.mp3') as number,
  al_jami: require('../assets/audio/al_jami.mp3') as number,
  al_ghani: require('../assets/audio/al_ghani.mp3') as number,
  al_mughni: require('../assets/audio/al_mughni.mp3') as number,
  al_mani: require('../assets/audio/al_mani.mp3') as number,
  ad_darr: require('../assets/audio/ad_darr.mp3') as number,
  an_nafi: require('../assets/audio/an_nafi.mp3') as number,
  an_nur: require('../assets/audio/an_nur.mp3') as number,
  al_hadi: require('../assets/audio/al_hadi.mp3') as number,
  al_badi: require('../assets/audio/al_badi.mp3') as number,
  al_baqi: require('../assets/audio/al_baqi.mp3') as number,
  al_warith: require('../assets/audio/al_warith.mp3') as number,
  ar_rashid: require('../assets/audio/ar_rashid.mp3') as number,
  as_sabur: require('../assets/audio/as_sabur.mp3') as number,
  // Further Names corpus entries — only al_ahad had a matching clip in the
  // source repo; the other three fall back to the silent placeholder.
  al_ahad: require('../assets/audio/al_ahad.mp3') as number,
  al_qarib: PLACEHOLDER,
  ar_rabb: PLACEHOLDER,
  al_fatir: PLACEHOLDER,
};

export default manifest;
