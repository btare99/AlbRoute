import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['leaflet'],
};

export default nextConfig;
// ─── NGJYRAT ZYRTARE PER LINJAT ─────────────────────────────────────────────
// Bazuar në legendën e hartës zyrtare

export const BUS_ROUTES = [
  // ── LINJA 1A: Allias – Selitë ─────────────────────────────────────────────
  {
    id: 'L1A', name: '1A', label: 'Allias – Selitë', color: '#e63946',
    stops: [
      'allias', 'kopshti_27', 'parafabrikatet', 'bajram_curri', 'shkolla_bashkuar',
      'mjekesia', 'qsut', 'tregu_5_maji', 'dispanseria', 'shkencat_natyres',
      'muzeu_kombetar', 'shallvaret', 'brigada_8', 'rruga_moskat', 'posta_8',
      'komuna_e_parisit', 'tish_daija', 'dhimiter_shuteriqi', 'qendra_kristal_1', 'selite'
    ],
    returnStops: [
      'selite', 'rrapo_hekali', 'nenkalimi', 'qendra_kristal_2', 'prokop_mima',
      'lulishtja', 'stadiumi_dinamo', 'lulishte_cajupi', 'drejtoria_e_policise_b',
      'parku_rinia', 'kateshet_a', 'materniteti', 'stacioni_i_trenit', 'shkencat_natyres',
      'dispanseria', 'tregu_5_maji', 'qsut', 'mjekesia', 'shkolla_bashkuar',
      'bajram_curri', 'parafabrikatet', 'kopshti_27', 'allias'
    ]
  },

  // ── LINJA 1B: Allias – Kodra e Diellit ─────────────────────────────────────
  {
    id: 'L1B', name: '1B', label: 'Allias – Kodra e Diellit', color: '#f3797b',
    stops: [
      'allias', 'kopshti_27', 'parafabrikatet', 'bajram_curri', 'shkolla_bashkuar',
      'mjekesia', 'qsut', 'tregu_5_maji', 'dispanseria', 'shkencat_natyres',
      'muzeu_kombetar', 'shallvaret', 'brigada_8', 'rruga_moskat', 'posta_8',
      'komuna_e_parisit', 'tish_daija', 'dhimiter_shuteriqi', 'qendra_kristal_1',
      'selite', 'rexhep_pinari', 'kodra_diellit_2'
    ],
    returnStops: [
      'kodra_diellit_2', 'mentor_xhemali', 'selite', 'rrapo_hekali', 'nenkalimi',
      'qendra_kristal_2', 'prokop_mima', 'lulishtja', 'stadiumi_dinamo',
      'lulishte_cajupi', 'drejtoria_e_policise_b', 'parku_rinia', 'kateshet_a',
      'materniteti', 'stacioni_i_trenit', 'shkencat_natyres', 'dispanseria',
      'tregu_5_maji', 'qsut', 'mjekesia', 'shkolla_bashkuar', 'bajram_curri',
      'parafabrikatet', 'kopshti_27', 'allias'
    ]
  },

  // ── LINJA 2: Terminali Juglindor – Stacioni i Trenit ────────────────────────
  {
    id: 'L2', name: '2', label: 'Terminali Juglindor – Stacioni i Trenit', color: '#ed8bb8',
    stops: [
      'terminal_jugilor', 'teg', 'tuneli', 'liqeni_i_thate', 'rruga_peti',
      'kopshti_zoologjik', 'rruga_kosovareve', 'petro_nini_luarasi', 'sheshi_wilson',
      'libri_universitar', 'piramida1', 'biblioteka', 'stacioni_i_trenit'
    ],
    returnStops: [
      'stacioni_i_trenit', 'biblioteka', 'piramida2', 'rektorati', 'sheshi_wilson',
      'petro_nini_luarasi', 'rruga_kosovareve', 'kopshti_zoologjik', 'rruga_peti',
      'liqeni_i_thate', 'tuneli', 'teg', 'terminal_jugilor'
    ]
  },

  // ── LINJA 11: Porcelan – Qëndër ─────────────────────────────────────────────
  {
    id: 'L11', name: '11', label: 'Porcelan – Qëndër', color: '#2951dfff',
    stops: [
      'biblioteka', 'pazari_ri', 'optika', 'hoxha_tahsim', 'xhamlliku', 'varri_bamit',
      'oxhaku_l', 'artistike_migjeni_r', 'fresku', 'ikv', 'qendra_shendetesore',
      'kabina_elektrike', 'hysen_bastari', 'stacioni_shkolles_re', 'thesari'
    ],
    returnStops: [
      'thesari', '17_shkurti', 'bunkart_1', 'aziz_deliiu', 'thoma_filipeu',
      'fizika_berthamore', 'fresku', 'artistike_migjeni_l', 'oxhaku_l', 'varri_bamit',
      'xhamlliku', 'hoxha_tahsim', 'optika', 'pazari_ri', 'biblioteka'
    ]
  },

  // ── LINJA 4: Qender - City Park ──────────────────────────────────────────
  {
    id: 'L4', name: '4', label: 'Qender - City Park', color: '#9b59b6',
    stops: [
      'muzeu_kombetar', 'mine_peza', 'asllan_rusi_r', 'pandi_dardha', 'pallatet_arabe',
      'blloku_gintash', 'kthesa_kamzes', 'shkolla', 'at_zef_pellumbi', 'gryka_kacanikut',
      'qtu', 'yrshek', 'domje', 'dpshtrr', 'mbikalimi', 'dpm', 'radio_stacioni',
      'megatek', 'qafe_kashar', 'ura_limuthit', 'city_park'
    ],
    returnStops: [
      'city_park', 'ura_limuthit', 'qafe_kashar', 'megatek', 'radio_stacioni',
      'dpm', 'mbikalimi', 'dpshtrr', 'domje', 'yrshek', 'qtu', 'gryka_kacanikut',
      'at_zef_pellumbi', 'shkolla', 'blloku_gintash_a',
      'pallatet_arabe_a', 'ana_komena', 'asllan_rusi_a', 'qemal_stafa',
      'dollari', 'muzeu_kombetar'
    ]
  },

  // ── LINJA 5A: Lanabregas – 1 Maji ──────────────────────────────────────────
  {
    id: 'L5A', name: '5A', label: 'Lanabregas – 1 Maji', color: '#2ecc71',
    stops: [
      'lanabregas', 'autotraktoret', 'banesat_sociale', 'rruga_spahiu', 'novruz_qosja',
      'pallatet_shkoze', 'ura_shkoze', 'poligrafiku', 'markata', 'dali_ndreu',
      'kushtrimi_lirise', 'sheshi_cameria', 'ali_demi', 'sheshi_ali_demi',
      'leopold_berthold', 'brryli', 'ministria_jashtme', 'atsh',
      'kateshet_a'
    ],
    returnStops: [
      'kateshet_a', 'dollari', 'parku_rinia', 'shkolla_baletit', '1_maji',
      'ali_demi', 'sheshi_cameria', 'kushtrimi_lirise', 'dali_ndreu', 'markata',
      'poligrafiku', 'ura_shkoze', 'pallatet_shkoze', 'novruz_qosja', 'rruga_spahiu',
      'banesat_sociale', 'autotraktoret',
    ]
  },
  // ── LINJA 5B: Institut – Gjethja ─────────────────────────────────────────────
  {
    id: 'L5B', name: '5B', label: 'Institut – Gjethja', color: '#1abc9c',
    stops: [
      'instituti_bujqesor', 'koder_kamez', 'ura_paskuqanit', 'treshi', 'rruga_kastriotet',
      'terminali_c', 'blloku_gintash_a', 'pallatet_arabe_a', 'ana_komena', 'asllan_rusi_r',
      'qemal_stafa', 'gjethja'
    ],
    returnStops: [
      'muzeu_kombetar', 'mine_peza', 'qemal_stafa', 'asllan_rusi_r', 'ana_komena',
      'pallatet_arabe', 'blloku_gintash', 'terminali_a', 'rruga_kastriotet', 'treshi',
      'ura_paskuqanit', 'koder_kamez', 'instituti_bujqesor'
    ]
  },

  // ── LINJA 6: Laprakë – Qendër ─────────────────────────────────────────────
  {
    id: 'L6', name: '6', label: 'Laprakë – Qendër', color: '#f39c12',
    stops: [
      'pesembedhjete_kateshet', 'materniteti', 'harry_fultz', 'don_bosko', 'vizion_plus',
      'rruga_muzaket', 'ptuu', 'administrativja', 'spitali_ushtarak', 'laprake',
      'aleks_buda', 'gjergj_legisi', 'vangjel_noti', 'shinat_e_trenit', 'skender_luarasi',
      'mark_bajraktari', 'isuf_uka', 'gjergj_fishta'
    ],
    returnStops: [
      'gjergj_fishta', 'isuf_uka', 'mark_bajraktari', 'skender_luarasi', 'shinat_e_trenit',
      'vangjel_noti', 'gjergj_legisi', 'aleks_buda', 'laprake', 'spitali_ushtarak',
      'administrativja', 'ptuu', 'rruga_muzaket', 'vizion_plus', 'don_bosko',
      'harry_fultz', 'stacioni_i_trenit', 'pesembedhjete_kateshet'
    ]
  },
  // ── LINJA 8A: Terminali Juglindor – Qendër ──────────────────────────────────
  {
    id: 'L8A', name: '8A', label: 'Terminali Juglindor – Qendër', color: '#3498db',
    stops: [
      'terminal_jugilor', 'teg', 'haxhi_dushku', 'panorama_liqenit', 'hamid_dalipi',
      'policia_ushtarake', 'spitali_veterinar', 'rethrrotullimi', 'deshmoret',
      'haki_shehu', 'vilat_gjermane', 'filologjiku', 'liceu_artistik', 'posta_1',
      'kateshet_a', 'dollari'
    ],
    returnStops: [
      'dollari', 'parlamenti', 'posta_1', 'liceu_artistik', 'filologjiku', 'vilat_gjermane',
      'haki_shehu', 'pallati_brigadave', 'rethrrotullimi', 'spitali_veterinar', 'policia_ushtarake',
      'hamid_dalipi', 'panorama_liqenit', 'haxhi_dushku', 'teg', 'terminal_jugilor'
    ]
  },

  // ── LINJA 8B: Qender - Sanatorium ──────────────────────────────────
  {
    id: 'L8B', name: '8B', label: 'Qender - Sanatorium', color: '#0c5f96ff',
    stops: [
      'sanatoriumi', 'nuri_arapi', 'shefqet_ndroqi', 'zona_industriale', 'rethrrotullimi',
      'deshmoret', 'haki_shehu', 'vilat_gjermane', 'filologjiku', 'liceu_artistik',
      'posta_1', 'kateshet_a', 'dollari'
    ],
    returnStops: [
      'dollari', 'parlamenti', 'posta_1', 'liceu_artistik', 'filologjiku', 'vilat_gjermane',
      'haki_shehu', 'pallati_brigadave', 'rethrrotullimi', 'shefqet_ndroqi', 'nuri_arapi', 'sanatoriumi'
    ]
  },
  // ── LINJA 8C: Qender - Sauk i Vjeter ─────────────────────────────
  {
    id: 'L8C', name: '8C', label: 'Qender - Sauk i Vjeter', color: '#4c69a4ff',
    stops: [
      'sauk_i_vjeter', 'ibrahim_braja', 'seit_bathorja', 'rethrrotullimi',
      'deshmoret', 'haki_shehu', 'vilat_gjermane', 'filologjiku', 'liceu_artistik',
      'posta_1', 'kateshet_a', 'dollari'
    ],
    returnStops: [
      'dollari', 'parlamenti', 'posta_1', 'liceu_artistik', 'filologjiku', 'vilat_gjermane',
      'haki_shehu', 'pallati_brigadave', 'rethrrotullimi_v', 'seit_bathorja',
      'ibrahim_braja', 'sauk_i_vjeter'
    ]
  },

  // ── LINJA 3A: Kashar ───────────────────────────────────────────────────────
  {
    id: 'L3A', name: '3A', label: 'Kashar (Banka Shqipërisë - Unazë)', color: '#ef4444',
    stops: [
      'banka_shqiperise_a', 'kisha_katolike_a', 'poliklinika_9_a', 'ura_teknologjike_a',
      'tregu_a', 'kombinati_mishit_a', 'joklin_persi_a', 'bego_hoxha_a', 'besim_alla_a',
      'yzberisht_a', 'pallati_minierave_a', 'ish_xhenio_a', 'mezez_a', 'serat_a',
      'erzen_lita_a', 'loni_ligori_a', 'njesia_kashar_a', 'nexho_konomi', 'kristaq_mone',
      'lumi_lane_a', 'sheshi_shqiponja_a', 'blloku_gintash_a', 'pallatet_arabe_a',
      'ana_komena', 'asllan_rusi_r_a', 'qemal_stafa', 'banka_shqiperise_a'
    ]
  },

  // ── LINJA 3C: Qendër - Yrshek ──────────────────────────────────────────────
  {
    id: 'L3C', name: '3C', label: 'Qendër – Yrshek (Top Channel)', color: '#f59e0b',
    stops: [
      'biblioteka', 'pesembedhjete_kateshet', 'banka_shqiperise_a', 'kisha_katolike_a',
      'poliklinika_9_a', 'ura_teknologjike_a', 'tregu_a', 'kombinati_mishit_a',
      'joklin_persi_a', 'bego_hoxha_a', 'besim_alla_a', 'yzberisht_a',
      'pallati_minierave_a', 'ish_xhenio_a', 'mezez_a', 'top_channel',
      'radio_planet', 'pasqyra', 'rruga_demokracia', 'xhamia', 'fusha_sportit', '100_vjetori'
    ]
  },

  // ── LINJA 3B: Kashar (One Way) ──────────────────────────────────────────────
  {
    id: 'L3B', name: '3B', label: 'Kashar (Unaza)', color: '#2a9d8f',
    stops: [
      'biblioteka', 'mine_peza', 'asllan_rusi_r', 'pandi_dardha',
      'pallatet_arabe', 'blloku_gintash', 'sheshi_shqiponja', 'lumi_lane', 'aleksandri_madh',
      'kryqezimi_kashar', 'tom_plezhra', 'njesia_kashar', 'loni_ligori', 'erzen_lita',
      'serat', 'mezez', 'ish_xhenio', 'pallati_minierave', 'yzberisht', 'besim_alla',
      'bego_hoxha', 'joklin_persi', 'komabinati_mishit', 'kthesa_yzberisht', 'tregu',
      'ura_teknologjike', 'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise', 'biblioteka'
    ]
  },
];
