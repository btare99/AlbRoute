// ─── HARTA ZYRTARE E LINJAVE URBANE, TIRANË ──────────────────────────────────
// Bazuar në hartën zyrtare të Bashkisë Tiranë (25.07.2024)

export const BUS_STOPS = [
  { id: 'ndre_mjeda', name: 'Ndre Mjeda', lat: 41.32381392093657, lng: 19.796618272968402 },
  { id: 'bryli_orar', name: 'Brryli', lat: 41.33049805997018, lng: 19.83376871938563 },
  { id: 'ish_ekspozita_orar', name: 'Ish Ekspozita', lat: 41.3255, lng: 19.8145 },
  { id: 'vasil_shanto_antiorar', name: 'Vasil Shanto', lat: 41.320687204881224, lng: 19.805554735017974 },
  // Porcelani
  { id: 'biblioteka', name: 'Biblioteka Kombetare', lat: 41.328380772224, lng: 19.82098880092712 },
  { id: 'pazari_ri_stop1', name: 'Pazari i Ri', lat: 41.329073643100294, lng: 19.824475672613367 },
  { id: 'pazari_ri_stop2', name: 'Pazari i Ri', lat: 41.32908730349642, lng: 19.823859816027298 },
  { id: 'optika_stop1', name: 'Optika', lat: 41.33159285600485, lng: 19.829469656181637 },
  { id: 'optika_stop2', name: 'Optika', lat: 41.33160739312691, lng: 19.82914808077014 },
  { id: 'hoxha_tahsim_stop1', name: 'Hoxha Tahsim', lat: 41.33342730580358, lng: 19.83314492037184 },
  { id: 'hoxha_tahsim_stop2', name: 'Hoxha Tahsim', lat: 41.33336565645783, lng: 19.832744920860588 },
  { id: 'xhamlliku_stop1', name: 'Xhamlliku', lat: 41.335826769693675, lng: 19.83820542770278 },
  { id: 'xhamlliku_stop2', name: 'Xhamlliku', lat: 41.33586249119033, lng: 19.837982502089083 },
  { id: 'varri_bamit_stop1', name: 'Varri i Bamit', lat: 41.33807968354699, lng: 19.84137520319216 },
  { id: 'varri_bamit_stop2', name: 'Varri i Bamit', lat: 41.33885241090061, lng: 19.842051739996204 },
  { id: 'oxhaku_l', name: 'Oxhaku L', lat: 41.33961129345346, lng: 19.84315125442063 },
  { id: 'artistike_migjeni_stop1', name: 'Artistike Migjeni R', lat: 41.342181906274625, lng: 19.84600432152968 },
  { id: 'artistike_migjeni_stop2', name: 'Artistike Migjeni L', lat: 41.34208726025871, lng: 19.845773651558957 },
  { id: 'fresku_stop1', name: 'Fresku', lat: 41.3461846334508, lng: 19.85522038159125 },
  { id: 'fresku_stop2', name: 'Fresku', lat: 41.346239158078035, lng: 19.85520620250371 },
  { id: 'ikv_stop1', name: 'IKV', lat: 41.34517101892639, lng: 19.850844009155836 },
  { id: 'ikv_stop2', name: 'IKV', lat: 41.34518044373104, lng: 19.850575417889868 },
  { id: 'qendra_shendetesore', name: 'Qendra Shendetesore', lat: 41.34683813549617, lng: 19.858778414198305 },
  { id: 'kabina_elektrike', name: 'Kabina Elektrike', lat: 41.348514339469155, lng: 19.862095156770636 },
  { id: 'hysen_bastari', name: 'Hysen Bastari', lat: 41.34889017649624, lng: 19.863171884391157 },
  { id: 'stacioni_shkolles_re', name: 'Stacioni i Shkolles Se Re', lat: 41.34947850349839, lng: 19.865378456780363 },
  { id: 'thesari', name: 'Thesari', lat: 41.35050926976404, lng: 19.867395811976152 },
  { id: '17_shkurti', name: '17 Shkurti', lat: 41.35074281327374, lng: 19.864606248494386 },
  { id: 'bunkart_1', name: 'Bunkart 1', lat: 41.35025680092905, lng: 19.861808572535896 },
  { id: 'aziz_deliiu', name: 'Aziz Deliu', lat: 41.349423209138756, lng: 19.859346304695986 },
  { id: 'thoma_filipeu', name: 'Thoma Filipeu', lat: 41.348439848563906, lng: 19.857639734096367 },
  { id: 'fizika_berthamore', name: 'Fizika Berthamore', lat: 41.34758088579516, lng: 19.85623775816502 },

  // ── LINJA 1A: Allias-Selite ─────────────────────────────────────────────
  { id: 'allias', name: 'Allias', lat: 41.350578339328315, lng: 19.831366656177238 },
  { id: 'kopshti_27_stop1', name: 'Kopshti 27', lat: 41.34840374040633, lng: 19.833190558271294 },
  { id: 'kopshti_27_stop2', name: 'Kopshti 27', lat: 41.348067023818935, lng: 19.833256792625086 },
  { id: 'parafabrikatet_stop1', name: 'Parafabrikatet', lat: 41.34674091797127, lng: 19.8367626740988 },
  { id: 'parafabrikatet_stop2', name: 'Parafabrikatet', lat: 41.34666400897193, lng: 19.836763260608468 },
  { id: 'bajram_curri_stop1', name: 'Bajram Curri', lat: 41.34620815703197, lng: 19.838344501662025 },
  { id: 'bajram_curri_stop2', name: 'Bajram Curri', lat: 41.346221014361646, lng: 19.838286755309618 },
  { id: 'shkolla_bashkuar_stop1', name: 'Shkolla Bashkuar', lat: 41.34452811015222, lng: 19.837270848588986 },
  { id: 'shkolla_bashkuar_stop2', name: 'Shkolla Bashkuar', lat: 41.3441107077933, lng: 19.836269734172642 },
  { id: 'mjekesia_stop1', name: 'Mjekesia', lat: 41.342413156760784, lng: 19.833954106370715 },
  { id: 'mjekesia_stop2', name: 'Mjekesia', lat: 41.341855342715284, lng: 19.832439539725485 },
  { id: 'qsut_stop1', name: 'QSUT', lat: 41.340286454665744, lng: 19.82978339083094 },
  { id: 'qsut_stop2', name: 'QSUT', lat: 41.340680098365915, lng: 19.830218545288094 },
  { id: 'tregu_5_maji_stop1', name: 'Tregu 5 Maji', lat: 41.33993025228956, lng: 19.82570528049075 },
  { id: 'tregu_5_maji_stop2', name: 'Tregu 5 Maji', lat: 41.340068862061905, lng: 19.825399826048734 },
  { id: 'dispanseria_stop1', name: 'Dispanseria', lat: 41.33765349565131, lng: 19.821208608745216 },
  { id: 'dispanseria_stop2', name: 'Dispanseria', lat: 41.33799687627965, lng: 19.821399567443546 },
  { id: 'shkencat_natyres', name: 'Shkencat e Natyres', lat: 41.33524183977649, lng: 19.816303370346546 },
  { id: 'muzeu_kombetar', name: 'Muzeu Kombetar', lat: 41.33017855214433, lng: 19.816646693093652 },
  { id: 'shallvaret', name: 'Shallvaret', lat: 41.32415468926219, lng: 19.817221613815853 },
  { id: 'brigada_8', name: 'Brigada 8', lat: 41.32160624514186, lng: 19.813570964750276 },
  { id: 'rruga_moskat', name: 'Rruga Moskat', lat: 41.31927419835486, lng: 19.81422126035806 },
  { id: 'posta_8_stop1', name: 'Posta 8', lat: 41.31812700055339, lng: 19.813417959876933 },
  { id: 'posta_8_stop2', name: 'Posta 8', lat: 41.31821055912352, lng: 19.812893566903632 },
  { id: 'komuna_parisit_stop2', name: 'Komuna Parisit', lat: 41.31864770083064, lng: 19.80768471700935 },
  { id: 'tish_daija', name: 'Tish Daija', lat: 41.31637684528332, lng: 19.805824141391753 },
  { id: 'dhimiter_shuteriqi', name: 'Dhimiter Shuteriqi', lat: 41.31446976262468, lng: 19.804236596303475 },
  { id: 'qendra_kristal_1', name: 'Qendra Kristal 1', lat: 41.31382247506085, lng: 19.80151550375448 },
  { id: 'selite', name: 'Selite', lat: 41.31543762185999, lng: 19.797475835407056 },
  { id: 'rrapo_hekali', name: 'Rrapo Hekali', lat: 41.31340856972316, lng: 19.801007820334256 },
  { id: 'nenkalimi', name: 'Nenkalimi', lat: 41.312122059723535, lng: 19.80456459660223 },
  { id: 'qendra_kristal_2', name: 'Qendra Kristal 2', lat: 41.31329257414136, lng: 19.80342599886747 },
  { id: 'prokop_mima', name: 'Prokop Mima', lat: 41.31394525242991, lng: 19.80569610997833 },
  { id: 'lulishtja', name: 'Lulishtja ', lat: 41.31663587176773, lng: 19.80683016687634 },
  { id: 'stadiumi_dinamo', name: 'Stadiumi Dinamo', lat: 41.31928375251999, lng: 19.80837968959587 },
  { id: 'lulishte_cajupi', name: 'Lulishte Cajupi', lat: 41.322140948455164, lng: 19.81098877100529 },
  { id: 'drejtoria_e_policise_b', name: 'Drejtoria e Policise B', lat: 41.324700404209736, lng: 19.81282079885007 },
  { id: 'parku_rinia', name: 'Parku Rinia', lat: 41.32551442528089, lng: 19.816626424076563 },
  { id: 'kateshet_a', name: '9 Kateshet A', lat: 41.32940343895082, lng: 19.821476918928166 },
  { id: 'materniteti', name: 'Materniteti', lat: 41.33471972494674, lng: 19.81681413863808 },
  { id: 'stacioni_i_trenit', name: 'Stacioni i Trenit', lat: 41.33596882919001, lng: 19.817041584157213 },

  // ── LINJA 1B: Allias-Kodra e Diellit ─────────────────────────────────────────────
  { id: 'rexhep_pinari_stop1', name: 'Rexhep Pinari', lat: 41.3105241456187, lng: 19.797987379154495 },
  { id: 'rexhep_pinari_stop2', name: 'Rexhep Pinari', lat: 41.310289968615095, lng: 19.79815158881314 },
  { id: 'kodra_diellit_2', name: 'Kodra e Diellit 2', lat: 41.30691411670897, lng: 19.798410598315687 },
  { id: 'mentor_xhemali_stop1', name: 'Mentor Xhemali', lat: 41.31403239724616, lng: 19.79836188035792 },
  { id: 'mentor_xhemali_stop2', name: 'Mentor Xhemali', lat: 41.31379401988683, lng: 19.798283246413156 },

  // ── LINJA 2: Terminali Juglindor – Stacioni i Trenit ─────────────────────────────────────────────
  { id: 'terminal_jugilor', name: 'Terminali Juglindor ', lat: 41.283362180910885, lng: 19.855547708728487 },
  { id: 'teg', name: 'TEG ', lat: 41.28301273658262, lng: 19.858311742061524 },
  { id: 'tuneli', name: 'Tuneli ', lat: 41.30522471324829, lng: 19.82241895442661 },
  { id: 'liqeni_i_thate_stop1', name: 'Liqeni i Thate ', lat: 41.305321427733894, lng: 19.81583144914248 },
  { id: 'liqeni_i_thate_stop2', name: 'Liqeni i Thate ', lat: 41.305745963530185, lng: 19.814865658529722 },
  { id: 'rruga_peti', name: 'Rruga Peti ', lat: 41.30706226337961, lng: 19.813342359225885 },
  { id: 'kopshti_zoologjik_stop1', name: 'Kopshti Zoologjik', lat: 41.30896423442469, lng: 19.811153676662514 },
  { id: 'kopshti_zoologjik_stop2', name: 'Kopshti Zoologjik', lat: 41.309052802328296, lng: 19.81101332675374 },
  { id: 'rruga_kosovareve_stop1', name: 'Rruga Kosovareve', lat: 41.312590720330434, lng: 19.814801480859966 },
  { id: 'rruga_kosovareve_stop2', name: 'Rruga Kosovareve', lat: 41.31215487732939, lng: 19.81407626081466 },
  { id: 'petro_nini_luarasi', name: 'Petro Nini Luarasi ', lat: 41.317475351271646, lng: 19.81485948421849 },
  { id: 'sheshi_wilson', name: 'Sheshi Wilson', lat: 41.3176526276786, lng: 19.814682458427008 },
  { id: 'libri_universitar_stop1', name: 'Libri Universitar ', lat: 41.31919168895222, lng: 19.81828198285922 },
  { id: 'libri_universitar_stop2', name: 'Libri Universitar ', lat: 41.319248422393464, lng: 19.818127723607347 },
  { id: 'rektorati', name: 'Rektorati', lat: 41.31772953432703, lng: 19.821774246651948 },
  { id: 'piramida1', name: 'Piramida 1', lat: 41.32283177175518, lng: 19.82004965561363 },
  { id: 'piramida2', name: 'Piramida 2 ', lat: 41.32304126298168, lng: 19.819776070298364 },

  // ── LINJA 3B: Kashar AntiOrar ─────────────────────────────────────────────
  { id: 'mine_peza', name: 'Mine Peza ', lat: 41.333569421711644, lng: 19.80674291771105 },
  { id: 'asllan_rusi_r', name: 'Asllan Rusi R ', lat: 41.33416459640128, lng: 19.801557682853122 },
  { id: 'pandi_dardha', name: 'Pandi Dardha ', lat: 41.33540578983218, lng: 19.797910946667383 },
  { id: 'pallatet_arabe', name: 'Pallatet Arabe ', lat: 41.337107460290774, lng: 19.793143134080232 },
  { id: 'blloku_gintash', name: 'Blloku Gintash ', lat: 41.33802042750709, lng: 19.790387510451012 },
  { id: 'sheshi_shqiponja', name: 'Sheshi Shqiponja ', lat: 41.338469519480455, lng: 19.785074054407584 },
  { id: 'lumi_lane', name: 'Lumi Lane ', lat: 41.33570644715858, lng: 19.783035575540413 },
  { id: 'aleksandri_madh', name: 'Aleksandri Madh ', lat: 41.33156680279061, lng: 19.783843243021067 },
  { id: 'kryqezimi_kashar', name: 'Kryqezimi Kashar ', lat: 41.330403693705655, lng: 19.78450975943949 },
  { id: 'tom_plezhra', name: 'Tom Plezha ', lat: 41.32939149427423, lng: 19.783637560275483 },
  { id: 'njesia_kashar', name: 'Njesia Kashar ', lat: 41.331199471817996, lng: 19.780236317635282 },
  { id: 'loni_ligori', name: 'Loni Ligori ', lat: 41.332467071738385, lng: 19.77834605009267 },
  { id: 'erzen_lita', name: 'Erzen Lita ', lat: 41.33416861122693, lng: 19.775783570038627 },
  { id: 'serat', name: 'Serat ', lat: 41.34066588798337, lng: 19.765458042419876 },
  { id: 'mezez', name: 'Mezez ', lat: 41.33830906222061, lng: 19.76378062257861 },
  { id: 'ish_xhenio', name: 'Ish-Xhenio', lat: 41.33382281047767, lng: 19.769939170588206 },
  { id: 'pallati_minierave', name: 'Pallati Minierave', lat: 41.32841099818441, lng: 19.77403719246638 },
  { id: 'yzberisht', name: 'Yzberisht ', lat: 41.32647753073683, lng: 19.773737435671148 },
  { id: 'besim_alla', name: 'Besim Alla ', lat: 41.32489077708363, lng: 19.774021003297992 },
  { id: 'bego_hoxha', name: 'Bego Hoxha ', lat: 41.32372052933106, lng: 19.776594680569744 },
  { id: 'joklin_persi', name: 'Joklin Persi', lat: 41.32339314737342, lng: 19.779115717984233 },
  { id: 'kombinati_mishit', name: 'Kombinati Mishit', lat: 41.322993585241534, lng: 19.781680864065752 },
  { id: 'kthesa_yzberisht_stop1', name: 'Kthesa Yzberisht ', lat: 41.31988392403415, lng: 19.78434113980807 },
  { id: 'kthesa_yzberisht_stop2', name: 'Kthesa Yzberisht ', lat: 41.319432343286316, lng: 19.78254495351823 },
  { id: 'tregu', name: 'Tregu', lat: 41.320870988692576, lng: 19.787372035966353 },
  { id: 'ura_teknologjike', name: 'Ura Teknologjike ', lat: 41.32272018389025, lng: 19.793525023429417 },
  { id: 'myhedin_llagami', name: 'Myhedin Llagami ', lat: 41.3240617240477, lng: 19.798277897842887 },
  { id: 'poliklinika_9', name: 'Poliklinika 9 ', lat: 41.325911706782826, lng: 19.804278576666356 },
  { id: 'kisha_katolike', name: 'Kisha Katolike ', lat: 41.327561634747035, lng: 19.809621504826897 },
  { id: 'banka_e_shqiperise', name: 'Banka e Shqiperise', lat: 41.32809600437263, lng: 19.815585226992447 },


  // ── LINJA 3A: Kashar AntiOrar ─────────────────────────────────────────────
  { id: 'banka_shqiperise_a', name: 'Banka e Shqiperise', lat: 41.32832001470477, lng: 19.815081907826674 },
  { id: 'kisha_katolike_a', name: 'Kisha Katolike ', lat: 41.32764434852337, lng: 19.809278310782506 },
  { id: 'poliklinika_9_a', name: 'Poliklinika 9 ', lat: 41.32636733760706, lng: 19.805018962880016 },
  { id: 'ura_teknologjike_a', name: 'Ura Teknologjike ', lat: 41.32276534570621, lng: 19.792940544521663 },
  { id: 'tregu_a', name: 'Tregu ', lat: 41.32093214712225, lng: 19.787105409852554 },
  { id: 'kombinati_mishit_a', name: 'Kombinati Mishit', lat: 41.32304446127753, lng: 19.781867928770218 },
  { id: 'joklin_persi_a', name: 'Joklin Persi', lat: 41.323511785384376, lng: 19.779024787219733 },
  { id: 'bego_hoxha_a', name: 'Bego Hoxha', lat: 41.32372052933106, lng: 19.776594680569744 },
  { id: 'besim_alla_a', name: 'Besim Alla', lat: 41.3250022464545, lng: 19.774291674380997 },
  { id: 'yzberisht_a', name: 'Yzberisht', lat: 41.32652111119202, lng: 19.773842759398097 },
  { id: 'pallati_minierave_a', name: 'Pallati Minierave', lat: 41.32841099818441, lng: 19.77403719246638 },
  { id: 'ish_xhenio_a', name: 'Ish-Xhenio', lat: 41.333953187847435, lng: 19.770001836089083 },
  { id: 'mezez_a', name: 'Mezez', lat: 41.3383085441753, lng: 19.763947173753092 },
  { id: 'serat_a', name: 'Serat', lat: 41.34077795479001, lng: 19.765637521671643 },
  { id: 'erzen_lita_a', name: 'Erzen Lita', lat: 41.33421670625306, lng: 19.775363211585187 },
  { id: 'loni_ligori_a', name: 'Loni Ligori', lat: 41.332322692492724, lng: 19.7781698132502 },
  { id: 'njesia_kashar_a', name: 'Njesia Kashar', lat: 41.33073369278043, lng: 19.78068303067838 },
  { id: 'nexho_konomi', name: 'Nexho Konomi', lat: 41.33024426524742, lng: 19.785135497613805 },
  { id: 'kristaq_mone', name: 'Kristaq Mone', lat: 41.332598480356495, lng: 19.78384264943948 },
  { id: 'lumi_lane_a', name: 'Lumi Lane ', lat: 41.33502150327103, lng: 19.78334235494618 },
  { id: 'sheshi_shqiponja_a', name: 'Sheshi Shqiponja', lat: 41.33789000490404, lng: 19.785562369932908 },
  { id: 'blloku_gintash_a', name: 'Blloku Gintash', lat: 41.33796292763321, lng: 19.78992013110371 },
  { id: 'pallatet_arabe_a', name: 'Pallatet Arabe', lat: 41.337144624853124, lng: 19.79225529464536 },
  { id: 'ana_komena', name: 'Ana Komena', lat: 41.3354587016194, lng: 19.796910171772453 },
  { id: 'asllan_rusi_r_a', name: 'Asllan Rusi R ', lat: 41.33413205259879, lng: 19.80091783982226 },
  { id: 'qemal_stafa', name: 'Qemal Stafa', lat: 41.33236109136387, lng: 19.80612639376832 },

  { id: 'pesembedhjete_kateshet', name: '15 Katëshat', lat: 41.330567730323644, lng: 19.81913830820661 },

  // ── LINJA 3C: Qender - Yrshek ───────────────────────────────────────────── 
  { id: 'top_channel_stop1', name: 'Top Channel ', lat: 41.340910291422425, lng: 19.760677023177987 },
  { id: 'top_channel_stop2', name: 'Top Channel', lat: 41.340901221172636, lng: 19.760485310252168 },
  { id: 'radio_planet_stop1', name: 'Radio Planet', lat: 41.34331663662546, lng: 19.75745360988623 },
  { id: 'radio_planet_stop2', name: 'Radio Planet', lat: 41.343139889633356, lng: 19.757515682661733 },
  { id: 'pasqyra_stop1', name: 'Pasqyra', lat: 41.34597054630015, lng: 19.75383156070586 },
  { id: 'pasqyra_stop2', name: 'Pasqyra', lat: 41.34614323092765, lng: 19.753213905674382 },
  { id: 'rruga_demokracia_stop1', name: 'Rruga Demokracia', lat: 41.34951375839497, lng: 19.747797401650853 },
  { id: 'rruga_demokracia_stop2', name: 'Rruga Demokracia', lat: 41.34923015586798, lng: 19.7481561285584 },
  { id: 'xhamia_yrshek_stop1', name: 'Xhamia', lat: 41.3509243423924, lng: 19.745291647356844 },
  { id: 'xhamia_yrshek_stop2', name: 'Xhamia', lat: 41.351152811444734, lng: 19.744803039274053 },
  { id: 'fusha_sportit_stop1', name: 'Fusha Sportit', lat: 41.3526422908893, lng: 19.741807701716255 },
  { id: 'fusha_sportit_stop2', name: 'Fusha Sportit', lat: 41.35248168554631, lng: 19.74202427075276 },
  { id: '100_vjetori', name: '100 Vjetori', lat: 41.35308466650584, lng: 19.73797763024168 },

  // ── LINJA 4: Qender - City Park ──────────────────────────────────────────────
  { id: 'kthesa_kamzes', name: 'Kthesa Kamzes', lat: 41.34354167932628, lng: 19.776416274756958 },
  { id: 'terminali_b', name: 'Terminali B', lat: 41.344040937974704, lng: 19.77611841084051 },
  { id: 'tregu_ushqimor_stop1', name: 'Tregu Ushqimor', lat: 41.34536823746401, lng: 19.769953071379934 },
  { id: 'tregu_ushqimor_stop2', name: 'Tregu Ushqimor', lat: 41.34522526851044, lng: 19.77002951433535 },
  { id: 'shkolla_stop1', name: 'Shkolla', lat: 41.34698094868577, lng: 19.765233797800686 },
  { id: 'shkolla_stop2', name: 'Shkolla', lat: 41.346853161032904, lng: 19.765404720735443 },
  { id: 'at_zef_pellumbi_stop1', name: 'At Zef Pellumbi', lat: 41.347887768039875, lng: 19.7626647448026 },
  { id: 'at_zef_pellumbi_stop2', name: 'At Zef Pellumbi', lat: 41.34797258668231, lng: 19.76214593934057 },
  { id: 'gryka_kacanikut_stop1', name: 'Gryka Kacanikut', lat: 41.35166235998139, lng: 19.751791116422606 },
  { id: 'gryka_kacanikut_stop2', name: 'Gryka Kacanikut', lat: 41.35162936326551, lng: 19.751635692050307 },
  { id: 'qtu_stop1', name: 'QTU ', lat: 41.352826888598145, lng: 19.748451348183657 },
  { id: 'qtu_stop2', name: 'QTU ', lat: 41.35261257197401, lng: 19.748826660678183 },
  { id: 'yrshek_stop1', name: 'Yrshek ', lat: 41.354747153946875, lng: 19.74294536329907 },
  { id: 'yrshek_stop2', name: 'Yrshek ', lat: 41.35480280406983, lng: 19.742443759036707 },
  { id: 'domje_stop1', name: 'Domje ', lat: 41.35840683316045, lng: 19.73236957710019 },
  { id: 'domje_stop2', name: 'Domje ', lat: 41.358475368488754, lng: 19.731843677453416 },
  { id: 'dpshtrr_stop1', name: 'DPSHTRr ', lat: 41.360310713857515, lng: 19.72686277391403 },
  { id: 'dpshtrr_stop2', name: 'DPSHTRr ', lat: 41.3603351211161, lng: 19.726521719118626 },
  { id: 'mbikalimi_stop1', name: 'Mbikalimi ', lat: 41.36173361257613, lng: 19.721825357181274 },
  { id: 'mbikalimi_stop2', name: 'Mbikalimi ', lat: 41.36177757395066, lng: 19.72123382562131 },
  { id: 'dpm_stop1', name: 'DPM', lat: 41.36268477680489, lng: 19.71816144888521 },
  { id: 'dpm_stop2', name: 'DPM', lat: 41.36264129425564, lng: 19.717928669135794 },
  { id: 'radio_stacioni_stop1', name: 'Radio Stacioni', lat: 41.36349431034081, lng: 19.714964577011862 },
  { id: 'radio_stacioni_stop2', name: 'Radio Stacioni', lat: 41.36353542934425, lng: 19.714360170403566 },
  { id: 'megatek_stop1', name: 'Megatek', lat: 41.36954297819546, lng: 19.7064675866568 },
  { id: 'megatek_stop2', name: 'Megatek', lat: 41.36937110758168, lng: 19.70660638622458 },
  { id: 'qafe_kashar_stop1', name: 'Qafe Kashar', lat: 41.36947098323661, lng: 19.699399897238823 },
  { id: 'qafe_kashar_stop2', name: 'Qafe Kashar', lat: 41.369606533877466, lng: 19.69810849051397 },
  { id: 'ura_limuthit_stop1', name: 'Ura Limuthit', lat: 41.37093913153896, lng: 19.69154791760511 },
  { id: 'ura_limuthit_stop2', name: 'Ura Limuthit', lat: 41.37088656015625, lng: 19.69132581079913 },
  { id: 'city_park', name: 'City Park', lat: 41.36716282826561, lng: 19.68873833986497 },
  { id: 'dollari', name: 'Dollari', lat: 41.327714735006666, lng: 19.81622172281785 },

  // ── LINJA 5A: Qender - Uzina Autotraktori ──────────────────────────────────────────────
  { id: 'lanabregas', name: 'Lanabregas', lat: 41.331611556034396, lng: 19.872421749988938 },
  { id: 'autotraktoret_stop1', name: 'Autotraktoret', lat: 41.33247878210308, lng: 19.867940168878853 },
  { id: 'autotraktoret_stop2', name: 'Autotraktoret', lat: 41.332321120551384, lng: 19.868054565390036 },
  { id: 'banesat_sociale_stop1', name: 'Banesat Sociale', lat: 41.333205054306475, lng: 19.86497053539327 },
  { id: 'banesat_sociale_stop2', name: 'Banesat Sociale', lat: 41.33310783710596, lng: 19.8648947937633 },
  { id: 'rruga_spahiu_stop1', name: 'Rruga Spahiu', lat: 41.33408161877719, lng: 19.863375098022033 },
  { id: 'rruga_spahiu_stop2', name: 'Rruga Spahiu', lat: 41.334110999169845, lng: 19.86296680634703 },
  { id: 'novruz_qosja_stop1', name: 'Novruz Qosja', lat: 41.33457469821732, lng: 19.85806849675956 },
  { id: 'novruz_qosja_stop2', name: 'Novruz Qosja', lat: 41.334446903090665, lng: 19.858329559114377 },
  { id: 'pallatet_shkoze_stop1', name: 'Pallatet Shkoze ', lat: 41.33471706589827, lng: 19.85418296379833 },
  { id: 'pallatet_shkoze_stop2', name: 'Pallatet Shkoze ', lat: 41.334580891957394, lng: 19.85346867831119 },
  { id: 'ura_shkoze_stop1', name: 'Ura Shkoze ', lat: 41.334160949049334, lng: 19.85197744048201 },
  { id: 'ura_shkoze_stop2', name: 'Ura Shkoze ', lat: 41.3339630925521, lng: 19.85167788061762 },
  { id: 'poligrafiku_stop1', name: 'Poligrafiku', lat: 41.33363003003347, lng: 19.84864465401347 },
  { id: 'poligrafiku_stop2', name: 'Poligrafiku', lat: 41.333600061083864, lng: 19.848937745759596 },
  { id: 'markata_stop1', name: 'Markata', lat: 41.33264721498136, lng: 19.84627136390501 },
  { id: 'markata_stop2', name: 'Markata', lat: 41.33242540465472, lng: 19.846080186332603 },
  { id: 'dali_ndreu_stop1', name: 'Dali Ndreu', lat: 41.330816716471695, lng: 19.843273512806075 },
  { id: 'dali_ndreu_stop2', name: 'Dali Ndreu', lat: 41.330863094008954, lng: 19.84357596902038 },
  { id: 'kushtrimi_lirise_stop1', name: 'Kushtrimi Lirise ', lat: 41.33058633366243, lng: 19.839508312159182 },
  { id: 'kushtrimi_lirise_stop2', name: 'Kushtrimi Lirise ', lat: 41.33058956661537, lng: 19.839942459743302 },
  { id: 'sheshi_cameria_stop1', name: 'Sheshi Cameria', lat: 41.32774725039586, lng: 19.835604517599776 },
  { id: 'sheshi_cameria_stop2', name: 'Sheshi Cameria', lat: 41.327958119173644, lng: 19.83626339221811 },
  { id: 'ali_demi_stop1', name: 'Ali Demi', lat: 41.3277929780918, lng: 19.831667553474247 },
  { id: 'ali_demi_stop2', name: 'Ali Demi', lat: 41.32770923508556, lng: 19.83183639175576 },
  { id: 'sheshi_ali_demi', name: 'Sheshi Ali Demi', lat: 41.32797576482631, lng: 19.829355233644332 },
  { id: 'leopold_berthold', name: 'Leopold Berthold', lat: 41.32997785230052, lng: 19.83400899871404 },
  { id: 'brryli', name: 'Brryli', lat: 41.33049805997018, lng: 19.83376871938563 },
  { id: 'ministria_jashtme', name: 'Ministria Jashtme', lat: 41.329540299994456, lng: 19.831548788964813 },
  { id: 'atsh', name: 'ATSH', lat: 41.327342947344796, lng: 19.827200997543486 },
  { id: 'parku_rinia', name: 'Parku Rinia', lat: 41.32503787671768, lng: 19.81917787572543 },
  { id: 'shkolla_baletit', name: 'Shkolla Baletit', lat: 41.32559112566621, lng: 19.82605642826449 },
  { id: '1_maji', name: '1 Maji', lat: 41.3277074950589, lng: 19.828931808915957 },

  // ── LINJA 5B: Qender - Institut ──────────────────────────────────────────────
  { id: 'instituti_bujqesor', name: 'Instituti Bujqesor', lat: 41.36083255621101, lng: 19.771838051295003 },
  { id: 'koder_kamez_stop1', name: 'Koder Kamez', lat: 41.35803989841281, lng: 19.77360399795592 },
  { id: 'koder_kamez_stop2', name: 'Koder Kamez', lat: 41.35820733385693, lng: 19.77318988461347 },
  { id: 'ura_paskuqanit_stop1', name: 'Ura Paskuqanit', lat: 41.355245314255825, lng: 19.774709401683175 },
  { id: 'ura_paskuqanit_stop2', name: 'Ura Paskuqanit', lat: 41.35513256714359, lng: 19.77447068508557 },
  { id: 'treshi_stop1', name: 'Treshi', lat: 41.351480416225506, lng: 19.770891099545977 },
  { id: 'treshi_stop2', name: 'Treshi', lat: 41.351498845968656, lng: 19.770625692812846 },
  { id: 'rruga_kastriotet_stop1', name: 'Rruga Kastriotet', lat: 41.34670117076417, lng: 19.774459306240114 },
  { id: 'rruga_kastriotet_stop2', name: 'Rruga Kastriotet', lat: 41.34701271261611, lng: 19.773994547314754 },
  { id: 'terminali_c', name: 'Terminali C', lat: 41.344334577244915, lng: 19.77595255988895 },
  { id: 'terminali_a', name: 'Terminali A', lat: 41.34445279903355, lng: 19.776194561850577 },
  { id: 'gjethja', name: 'Gjethja', lat: 41.32673677841546, lng: 19.81645700814633 },

  // ── LINJA 6: Qender - Laprake ──────────────────────────────────────────────
  { id: 'zyhdi_herri_stop1', name: 'Zyhdi Herri', lat: 41.35263642394508, lng: 19.769927429989192 },
  { id: 'zyhdi_herri_stop2', name: 'Zyhdi Herri', lat: 41.35293301073088, lng: 19.76961264254727 },
  { id: 'princ_vidi', name: 'Princ Vidi', lat: 41.35538883606453, lng: 19.766325756454766 },
  { id: 'nikolle_ivanaj_stop1', name: 'Nikolle Ivanaj', lat: 41.3574771794859, lng: 19.763360109305747 },
  { id: 'nikolle_ivanaj_stop2', name: 'Nikolle Ivanaj', lat: 41.357309071181085, lng: 19.763301771260824 },
  { id: 'kole_jakova_stop1', name: 'Kole Jakova', lat: 41.358067669345814, lng: 19.762513032771306 },
  { id: 'kole_jakova_stop2', name: 'Kole Jakova', lat: 41.35799317897009, lng: 19.76243323705469 },
  { id: 'gjoke_doci_stop1', name: 'Gjoke Doci', lat: 41.35897306796045, lng: 19.761520091572677 },
  { id: 'gjoke_doci_stop2', name: 'Gjoke Doci', lat: 41.35899018036424, lng: 19.761423532050053 },
  { id: 'gjergj_legisi', name: 'Gjergj Legisi', lat: 41.34166069745681, lng: 19.788780427483033 },
  { id: 'isuf_xhelili_stop1', name: 'Isuf Xhelili', lat: 41.36127809437976, lng: 19.76037418713289 },
  { id: 'isuf_xhelili_stop2', name: 'Isuf Xhelili', lat: 41.36123984446273, lng: 19.760265557669932 },
  { id: 'rruga_devolli_stop1', name: 'Rruga Devolli', lat: 41.362754906585614, lng: 19.75831370587487 },
  { id: 'rruga_devolli_stop2', name: 'Rruga Devolli', lat: 41.362615498759126, lng: 19.758327787471917 },
  { id: 'kamez', name: 'Kamez', lat: 41.36589439978208, lng: 19.757641453966503 },
  { id: 'ndoc_martini', name: 'Ndoc Martini', lat: 41.34697371019859, lng: 19.788794782307264 },
  { id: 'pas_nenkalimit', name: 'Pas Nenkalimit', lat: 41.34693599256988, lng: 19.788091397966657 },
  { id: 'shinat_e_trenit_stop1', name: 'Shinat e Trenit', lat: 41.34470803200807, lng: 19.787674726890753 },
  { id: 'shinat_e_trenit_stop2', name: 'Shinat e Trenit', lat: 41.344483221861715, lng: 19.787678097071193 },
  { id: 'skender_luarasi_stop1', name: 'Skender Luarasi', lat: 41.346017937134434, lng: 19.783849914577715 },
  { id: 'skender_luarasi_stop2', name: 'Skender Luarasi', lat: 41.345996118359146, lng: 19.783693570405152 },
  { id: 'mark_bajraktari_stop1', name: 'Mark Bajraktari', lat: 41.34686676989234, lng: 19.78211231539332 },
  { id: 'mark_bajraktari_stop2', name: 'Mark Bajraktari', lat: 41.34670811278978, lng: 19.782418728400046 },
  { id: 'isuf_uka_stop1', name: 'Isuf Uka', lat: 41.34865567560045, lng: 19.77968369963706 },
  { id: 'isuf_uka_stop2', name: 'Isuf Uka', lat: 41.34884703068451, lng: 19.779392311783994 },
  { id: 'gjergj_fishta_stop1', name: 'Gjergj Fishta', lat: 41.35128066693434, lng: 19.77262945783171 },
  { id: 'gjergj_fishta_stop2', name: 'Gjergj Fishta', lat: 41.351213870018505, lng: 19.773234527779604 },
  { id: 'vangjel_noti', name: 'Vangjel Noti', lat: 41.34287313715884, lng: 19.788443090116633 },
  { id: 'aleks_buda_stop1', name: 'Aleks Buda', lat: 41.3400204690665, lng: 19.790113357310037 },
  { id: 'aleks_buda_stop2', name: 'Aleks Buda', lat: 41.33986085654715, lng: 19.790201550947984 },
  { id: 'laprake_stop1', name: 'Laprake', lat: 41.33837090990503, lng: 19.793260884697915 },
  { id: 'laprake_stop2', name: 'Laprake', lat: 41.338326941927136, lng: 19.793156171648068 },
  { id: 'spitali_ushtarak_stop1', name: 'Spitali Ushtarak', lat: 41.34177623716342, lng: 19.795038304419943 },
  { id: 'spitali_ushtarak_stop2', name: 'Spitali Ushtarak', lat: 41.34168425516299, lng: 19.795039099935188 },
  { id: 'administrativja_stop1', name: 'Administrativja', lat: 41.342322500121355, lng: 19.798495134702883 },
  { id: 'administrativja_stop2', name: 'Administrativja', lat: 41.34224511146635, lng: 19.79860881210787 },
  { id: 'ptuu_stop1', name: 'PTUU', lat: 41.34127654694574, lng: 19.801560364962825 },
  { id: 'ptuu_stop2', name: 'PTUU', lat: 41.340964910531966, lng: 19.80163127044123 },
  { id: 'rruga_muzaket_stop1', name: 'Rruga Muzaket', lat: 41.3394673494007, lng: 19.80282687291348 },
  { id: 'rruga_muzaket_stop2', name: 'Rruga Muzaket', lat: 41.33904141814152, lng: 19.80292714447871 },
  { id: 'vizion_plus_stop1', name: 'Vizion Plus', lat: 41.33811787661754, lng: 19.803683152468707 },
  { id: 'vizion_plus_stop2', name: 'Vizion Plus', lat: 41.3376540348853, lng: 19.803796178999725 },
  { id: 'don_bosko', name: 'Don Bosko', lat: 41.33444689219681, lng: 19.80751901369489 },
  { id: 'harry_fultz', name: 'Harry Fultz', lat: 41.33516059868827, lng: 19.81184857816006 },
  { id: 'barrikadat', name: 'Barrikadat', lat: 41.33533780547874, lng: 19.81812123372163 },

  // ── LINJA 8A: Qender - Termiali Juglindor
  { id: 'haxhi_dushku_stop1', name: 'Haxhi Dushku', lat: 41.29378811785776, lng: 19.852843051329582 },
  { id: 'haxhi_dushku_stop2', name: 'Haxhi Dushku', lat: 41.2937202677847, lng: 19.852736671859166 },
  { id: 'panorama_liqenit_stop1', name: 'Panorama Liqenit', lat: 41.299118266014645, lng: 19.850775338307834 },
  { id: 'panorama_liqenit_stop2', name: 'Panorama Liqenit', lat: 41.298989740961076, lng: 19.85067439327972 },
  { id: 'hamid_dalipi_stop1', name: 'Hamid Dalipi', lat: 41.30105850597988, lng: 19.847750426377903 },
  { id: 'hamid_dalipi_stop2', name: 'Hamid Dalipi', lat: 41.30161555204534, lng: 19.84660632497492 },
  { id: 'policia_ushtarake_stop1', name: 'Policia Ushtarake', lat: 41.30553800482398, lng: 19.843179971346952 },
  { id: 'policia_ushtarake_stop2', name: 'Policia Ushtarake', lat: 41.30512929447053, lng: 19.843775330178797 },
  { id: 'spitali_veterinar', name: 'Spitali Veterinar', lat: 41.30681051653605, lng: 19.841124433342774 },
  { id: 'rethrrotullimi', name: 'Rrethrotullimi', lat: 41.30763112840011, lng: 19.839525907259503 },
  { id: 'pallati_brigadave', name: 'Pallati Brigadave', lat: 41.30868342407209, lng: 19.83711438695522 },
  { id: 'deshmoret', name: 'Deshmoret', lat: 41.311263759532316, lng: 19.836233475380496 },
  { id: 'haki_shehu', name: 'Haki Shehu', lat: 41.3145963722296, lng: 19.8345027897041 },
  { id: 'vilat_gjermane_stop1', name: 'Vilat Gjermane', lat: 41.317180874800485, lng: 19.833025712182227 },
  { id: 'vilat_gjermane_stop2', name: 'Vilat Gjermane', lat: 41.316508970823335, lng: 19.833141124658013 },
  { id: 'filologjiku_stop1', name: 'Filologjiku', lat: 41.31889154102206, lng: 19.82896532779203 },
  { id: 'filologjiku_stop2', name: 'Filologjiku', lat: 41.31853663909535, lng: 19.829290817363084 },
  { id: 'liceu_artistik_stop1', name: 'Liceu Artistik', lat: 41.321378019064554, lng: 19.825760216205527 },
  { id: 'liceu_artistik_stop2', name: 'Liceu Artistik', lat: 41.32125573867494, lng: 19.825640841181286 },
  { id: 'posta_1_stop1', name: 'Posta 1', lat: 41.32426258437683, lng: 19.82514406267624 },
  { id: 'posta_1_stop2', name: 'Posta 1', lat: 41.32370218757637, lng: 19.82472707934359 },
  { id: 'parlamenti', name: 'Parlamenti', lat: 41.32692813651838, lng: 19.823870839687565 },

  // ── LINJA 8B: Qender – Sanatorium ───────────────────
  { id: 'sanatoriumi', name: 'Sanatoriumi', lat: 41.31373717735935, lng: 19.844684115793758 },
  { id: 'nuri_arapi_stop1', name: 'Nuri Arapi', lat: 41.30937578119908, lng: 19.844433430607197 },
  { id: 'nuri_arapi_stop2', name: 'Nuri Arapi', lat: 41.309420397669754, lng: 19.844084738183795 },
  { id: 'shefqet_ndroqi', name: 'Shefqet Ndroqi', lat: 41.307493944249366, lng: 19.841179860340926 },

  // ── LINJA 8C: Qender - Sauk i Vjeter ─────────────────────────────
  { id: 'sauk_i_vjeter', name: 'Sauk i Vjeter', lat: 41.29951840101403, lng: 19.830051972087595 },
  { id: 'ibrahim_braja', name: 'Ibrahim Braja', lat: 41.30129748983332, lng: 19.831617635875567 },
  { id: 'seit_bathorja', name: 'Seit Bathorja', lat: 41.3032707019727, lng: 19.835061647209113 },
  { id: 'rethrrotullimi_v', name: 'Rrethrotullimi', lat: 41.30722631194845, lng: 19.84001447917246 },

  // ── LINJA 9A: Jordan Misja - Qyteti Studentit ─────────────────────────────
  { id: 'collakut', name: 'Collakut', lat: 41.320677563630305, lng: 19.854775796094252 },
  { id: 'binak_alia_stop1', name: 'Binak Alia', lat: 41.321062314496736, lng: 19.853340814299667 },
  { id: 'binak_alia_stop2', name: 'Binak Alia', lat: 41.32091518892765, lng: 19.853326530795478 },
  { id: 'depo_ujit_a_stop1', name: 'Depo Ujit A', lat: 41.322376591652635, lng: 19.849827033328026 },
  { id: 'depo_ujit_a_stop2', name: 'Depo Ujit A', lat: 41.322297244450986, lng: 19.84989146774893 },
  { id: 'naum_prifti', name: 'Naum Prifti', lat: 41.321291795697725, lng: 19.844741926029382 },
  { id: 'haki_gjici', name: 'Haki Gjici', lat: 41.32126762302041, lng: 19.8449725960001 },
  { id: 'kristaq_capo_stop1', name: 'Kristaq Capo', lat: 41.321012717949614, lng: 19.843464807492197 },
  { id: 'kristaq_capo_stop2', name: 'Kristaq Capo', lat: 41.32104341167113, lng: 19.843808378352396 },
  { id: 'kompleksi_stop1', name: 'Kompleksi', lat: 41.3205321483864, lng: 19.839740696688764 },
  { id: 'kompleksi_stop2', name: 'Kompleksi', lat: 41.32039413453762, lng: 19.839995361802547 },
  { id: 'godina_26_stop1', name: 'Godina 26', lat: 41.32139910588096, lng: 19.83615788945764 },
  { id: 'godina_26_stop2', name: 'Godina 26', lat: 41.321298562700036, lng: 19.836126123228418 },
  { id: 'godina_15_stop1', name: 'Godina 15', lat: 41.31990800611366, lng: 19.83492212883135 },
  { id: 'godina_15_stop2', name: 'Godina 15', lat: 41.31978858830338, lng: 19.835063806921763 },
  { id: 'ekonomiku_stop2', name: 'Ekonomiku', lat: 41.31887299306676, lng: 19.831235501511372 },
  { id: 'ekonomiku_stop1', name: 'Ekonomiku', lat: 41.31884862223631, lng: 19.831353478395595 },
  { id: 'stacioni_trenit_p', name: 'Stacioni Trenit', lat: 41.33579240948087, lng: 19.81477323137428 },
  { id: 'burgu_stop1', name: 'Burgu', lat: 41.33699973522266, lng: 19.81199631092415 },
  { id: 'burgu_stop2', name: 'Burgu', lat: 41.33686017136803, lng: 19.81192476784346 },
  { id: 'kolegji_stop1', name: 'Kolegji', lat: 41.33926686882925, lng: 19.811004544024147 },
  { id: 'kolegji_stop2', name: 'Kolegji', lat: 41.33915769635359, lng: 19.810938450467912 },
  { id: 'rruga_vjosa_stop1', name: 'Rruga Vjosa', lat: 41.34091634852547, lng: 19.810385197742928 },
  { id: 'rruga_vjosa_stop2', name: 'Rruga Vjosa', lat: 41.34083446079466, lng: 19.81036720152993 },
  { id: 'ali_progri_stop1', name: 'Ali Progri', lat: 41.343769940699346, lng: 19.80873756533525 },
  { id: 'ali_progri_stop2', name: 'Ali Progri', lat: 41.34366288857565, lng: 19.80865405651688 },
  { id: 'rruga_sejdini_stop1', name: 'Rruga Sejdini', lat: 41.34570700023389, lng: 19.807832640534794 },
  { id: 'rruga_sejdini_stop2', name: 'Rruga Sejdini', lat: 41.345410581384066, lng: 19.807821828671724 },
  { id: 'uzina_dinamo', name: 'Uzina Dinamo', lat: 41.347355009810556, lng: 19.80668811733669 },

  // ── LINJA 9B: Jordan Misja - Vilat Gjermane ─────────────────────────────
  { id: 'irfan_tershana_stop1', name: 'Irfan Tershana', lat: 41.31789739429421, lng: 19.845543922737892 },
  { id: 'irfan_tershana_stop2', name: 'Irfan Tershana', lat: 41.3182123935054, lng: 19.845708512329114 },
  { id: 'bicaket_stop1', name: 'Bicaket', lat: 41.317305619041186, lng: 19.842637879907848 },
  { id: 'bicaket_stop2', name: 'Bicaket', lat: 41.31744425273962, lng: 19.84293989974941 },
  { id: 'jup_kastrati_stop1', name: 'Jup Kastrati', lat: 41.316426481047024, lng: 19.839762547416864 },
  { id: 'jup_kastrati_stop2', name: 'Jup Kastrati', lat: 41.316565921178764, lng: 19.839968012183615 },
  { id: 'ambasada_palestines_stop1', name: 'Ambasada Palestines', lat: 41.31662208531942, lng: 19.8362144325532 },
  { id: 'ambasada_palestines_stop2', name: 'Ambasada Palestines', lat: 41.316667744340485, lng: 19.836429634377495 },
  { id: 'vellezerit_kondi_stop1', name: 'Vellezerit Kondi', lat: 41.31701237165257, lng: 19.834677361368918 },
  { id: 'vellezerit_kondi_stop2', name: 'Vellezerit Kondi', lat: 41.31713363121546, lng: 19.834540601477556 },

  // ── LINJA 10A: Qender – Marteniteti Ri ─────────────────────────────────────────
  { id: 'depo_ujit_b', name: 'Depo Ujit B', lat: 41.32438156582706, lng: 19.849880475371332 },
  { id: 'pal_engjelli_stop1', name: 'Pal Engjelli', lat: 41.32757001015527, lng: 19.84890144314062 },
  { id: 'pal_engjelli_stop2', name: 'Pal Engjelli', lat: 41.32754016970999, lng: 19.848806032892547 },
  { id: 'teqi_tartari_stop1', name: 'Teki Tartari', lat: 41.32848647452588, lng: 19.847199935686987 },
  { id: 'teqi_tartari_stop2', name: 'Teki Tartari', lat: 41.328320544514824, lng: 19.847331592846306 },
  { id: 'ura_stop1', name: 'Ura', lat: 41.32984149719154, lng: 19.845285754489325 },
  { id: 'ura_stop2', name: 'Ura', lat: 41.32979877831085, lng: 19.845173709827563 },
  { id: 'dhimiter_kamarda', name: 'Dhimiter Kamarda', lat: 41.33170878345358, lng: 19.844791258320207 },
  { id: 'pasho_hysa', name: 'Pasho Hysa', lat: 41.33140235874708, lng: 19.844555943232628 },
  { id: 'sabri_koci', name: 'Sabri Koci', lat: 41.332650356687424, lng: 19.84387519278399 },
  { id: 'selman_riza', name: 'Selman Riza', lat: 41.333081559109345, lng: 19.84343242531492 },
  { id: 'odise_grillo', name: 'Odhise Grillo', lat: 41.33326500703079, lng: 19.840592877346463 },
  { id: 'marteniteri_ri_a', name: 'Marteniteri Ri', lat: 41.331806840749444, lng: 19.83677877616114 },
  { id: 'ministria_shendetesise', name: 'Ministria Shendetesise', lat: 41.32925035509754, lng: 19.83235464049404 },
  { id: 'marteniteri_ri', name: 'Marteniteri Ri', lat: 41.3315772580336, lng: 19.837695572642023 },

  // ── LINJA 10B: Qender – Mihal Grameno ─────────────────────────────────────────
  { id: 'abedin_pash_dino_stop1', name: 'Abedin Pashe Dino', lat: 41.32207940004562, lng: 19.840065007549434 },
  { id: 'abedin_pash_dino_stop2', name: 'Abedin Pashe Dino', lat: 41.3219548005521, lng: 19.840168349263934 },
  { id: 'ali_visha', name: 'Ali Visha', lat: 41.32342585854858, lng: 19.837304750597436 },
  { id: 'mihal_grameno_stop1', name: 'Mihal Grameno', lat: 41.32411397654377, lng: 19.835232771383204 },
  { id: 'mihal_grameno_stop2', name: 'Mihal Grameno', lat: 41.324206466755044, lng: 19.834884291770226 },
  { id: 'tregu_elektrik_stop1', name: 'Tregu Elektrik', lat: 41.32563792454284, lng: 19.833239219510606 },
  { id: 'tregu_elektrik_stop2', name: 'Tregu Elektrik', lat: 41.325740935817734, lng: 19.833051062977884 },
  { id: 'njesia_2_stop1', name: 'Njesia 2', lat: 41.32570603991613, lng: 19.829979848513055 },
  { id: 'njesia_2_stop2', name: 'Njesia 2', lat: 41.325600154515676, lng: 19.829912323421933 },
  { id: 'shkolla_baletit', name: 'Shkolla Baletit', lat: 41.32542079554202, lng: 19.827040364701368 },

  // ── LINJA 10C: Fusha Aviacionit – Shkoze ─────────────────────────────────────────────
  { id: 'marketi', name: 'Marketi', lat: 41.3326996597304, lng: 19.840995050759343 },
  { id: 'kopshti_56', name: 'Kopshti 56', lat: 41.3331615403104, lng: 19.844889989171563 },
  { id: 'shkoze_stop1', name: 'Shkoze', lat: 41.33391513985811, lng: 19.849070638819303 },
  { id: 'shkoze_stop2', name: 'Shkoze', lat: 41.33441863770382, lng: 19.849291921058654 },
  { id: 'zjarrefiksja_stop1', name: 'Zjarrefiksja', lat: 41.328186994979916, lng: 19.800648737977806 },
  { id: 'zjarrefiksja_stop2', name: 'Zjarrefiksja', lat: 41.32817273499537, lng: 19.80048506735022 },
  { id: 'konviktet_stop1', name: 'Konviktet', lat: 41.3293090400562, lng: 19.800584982493266 },
  { id: 'konviktet_stop2', name: 'Konviktet', lat: 41.32932065824514, lng: 19.800455980425344 },
  { id: 'fusha_aviacionit_stop1', name: 'Fusha Aviacionit', lat: 41.33021433494017, lng: 19.79745047693554 },
  { id: 'fusha_aviacionit_stop2', name: 'Fusha Aviacionit', lat: 41.33002064500143, lng: 19.797315900668536 },
  { id: 'helikopteret_stop1', name: 'Helikopteret', lat: 41.3314646986075, lng: 19.794531631919703 },
  { id: 'helikopteret_stop2', name: 'Helikopteret', lat: 41.33137913919851, lng: 19.794505920262893 },
  { id: 'simon_gjoni_stop1', name: 'Simon Gjoni', lat: 41.333321405691045, lng: 19.79120040869184 },
  { id: 'simon_gjoni_stop2', name: 'Simon Gjoni', lat: 41.333222699115304, lng: 19.791205019931784 },
  { id: 'dhora_leka', name: 'Dhora Leka', lat: 41.335358289270395, lng: 19.78769301968793 },

  // ── LINJA 12: Uzina Dinamo – Sharrë ──────────────────────────────────────────
  { id: 'ura_paskuqanit', name: 'Ura e Paskuqanit', lat: 41.34781681358328, lng: 19.808750781680693 },
  { id: 'asllan_lala', name: 'Asllan Lala', lat: 41.34774020716616, lng: 19.811676985096906 },
  { id: 'nenstacioni_elektrik', name: 'Nenstacioni Elektrik', lat: 41.34588597674461, lng: 19.81434073857203 },
  { id: 'rruga_besa', name: 'Rruga Besa', lat: 41.34249006872084, lng: 19.816120754922782 },
  { id: 'frigoriferi', name: 'Frigoriferi', lat: 41.34061345442758, lng: 19.817394722115505 },
  { id: 'siri_kodra_stop1', name: 'Siri Kodra', lat: 41.33832149931276, lng: 19.818948362920473 },
  { id: 'siri_kodra_stop2', name: 'Siri Kodra', lat: 41.33769710102745, lng: 19.819623956609522 },
  { id: 'misto_mame', name: 'Misto Mame', lat: 41.318945254358376, lng: 19.78142194529472 },
  { id: 'ukt_stop1', name: 'UKT', lat: 41.317665147561485, lng: 19.77722392828682 },
  { id: 'ukt_stop2', name: 'UKT', lat: 41.317792250369955, lng: 19.77726844409436 },
  { id: 'mapo_stop1', name: 'Mapo', lat: 41.31576059150689, lng: 19.771754416940528 },
  { id: 'mapo_stop2', name: 'Mapo', lat: 41.31577988545304, lng: 19.771461745610516 },
  { id: 'kombinat_stop1', name: 'Kombinat', lat: 41.31426844352232, lng: 19.768043674692652 },
  { id: 'kombinat_stop2', name: 'Kombinat', lat: 41.3142061334698, lng: 19.76761191947786 },
  { id: 'komisariati_6_stop1', name: 'Komisariati 6', lat: 41.31247343842998, lng: 19.763575717295303 },
  { id: 'komisariati_6_stop2', name: 'Komisariati 6', lat: 41.31271529507327, lng: 19.763904610856333 },
  { id: 'varrezat_sharre_stop1', name: 'Varrezat Sharre', lat: 41.310541910647004, lng: 19.75978361206111 },
  { id: 'varrezat_sharre_stop2', name: 'Varrezat Sharre', lat: 41.31049383822419, lng: 19.759550762690342 },
  { id: 'kthesa_sharre_stop1', name: 'Kthesa Sharre', lat: 41.306682129689676, lng: 19.757215918373024 },
  { id: 'kthesa_sharre_stop2', name: 'Kthesa Sharre', lat: 41.306682129689676, lng: 19.757215918373024 },
  { id: 'prush_stop1', name: 'Prush', lat: 41.30569804048908, lng: 19.75449031508163 },
  { id: 'prush_stop2', name: 'Prush', lat: 41.30569804048908, lng: 19.75449031508163 },
  { id: 'fabrika_tullave_stop1', name: 'Fabrika Tullave', lat: 41.304903948127674, lng: 19.750717975372414 },
  { id: 'fabrika_tullave_stop2', name: 'Fabrika Tullave', lat: 41.304903948127674, lng: 19.750717975372414 },
  { id: 'karburanti', name: 'Karburanti', lat: 41.30326232377927, lng: 19.745399579714498 },
  { id: 'filip_jano', name: 'Filip Jano', lat: 41.345013852832125, lng: 19.808752845785687 },

  // ── LINJA 13A: Tirana e Re Orar ─────────────────────────────────────────────
  { id: 'komuna_parisit_stop1', name: 'Komuna Parisit', lat: 41.31877300236136, lng: 19.808346342666322 },
  { id: 'stadiumi_dinamo_stop2', name: 'Stadiumi Dinamo', lat: 41.31888283303763, lng: 19.808570920477415 },
  { id: 'vasil_shanto_stop1', name: 'Vasil Shanto', lat: 41.32170310174288, lng: 19.80461203048531 },
  { id: 'vasil_shanto_stop2', name: 'Vasil Shanto', lat: 41.320687204881224, lng: 19.805554735017974 },
  { id: 'pallati_me_shigjeta_stop1', name: 'Pallati me Shigjeta', lat: 41.321856143000744, lng: 19.792794178141932 },
  { id: 'pallati_me_shigjeta_stop2', name: 'Pallati me Shigjeta', lat: 41.320901112330496, lng: 19.793524687394115 },
  { id: 'teodor_keko_stop1', name: 'Teodor Keko', lat: 41.324036164179724, lng: 19.788755916536957 },
  { id: 'teodor_keko_stop2', name: 'Teodor Keko', lat: 41.3227706320602, lng: 19.78869990749091 },
  { id: 'kristaq_dollaku_stop1', name: 'Kristaq Dollaku', lat: 41.32625006633775, lng: 19.787244395061975 },
  { id: 'kristaq_dollaku_stop2', name: 'Kristaq Dollaku', lat: 41.3261749559414, lng: 19.786647653563946 },
  { id: 'don_bosko_orar', name: 'Don Bosko', lat: 41.33462483538115, lng: 19.807838070186605 },
  { id: 'harry_fultz_orar', name: 'Harry Fultz', lat: 41.3351525054002, lng: 19.810826639457304 },

  // ── LINJA 15A: Kombinat – Kinostudio ─────────────────────────────────────────────
  { id: 'aleksander_moisiu', name: 'Aleksander Moisiu', lat: 41.34547193825165, lng: 19.850521543444863 },
  { id: 'kinostudio_stop1', name: 'Kinostudio', lat: 41.346938705732185, lng: 19.846370250440746 },
  { id: 'kinostudio_stop2', name: 'Kinostudio', lat: 41.3468207963958, lng: 19.84637527195811 },
  { id: 'rruga_ura_stop1', name: 'Rruga Ura', lat: 41.34596097377481, lng: 19.84082795200048 },
  { id: 'rruga_ura_stop2', name: 'Rruga Ura', lat: 41.345746731667596, lng: 19.840635989971382 },
  { id: 'medreseja_stop1', name: 'Medreseja', lat: 41.33824469248576, lng: 19.82585028308114 },
  { id: 'medreseja_stop2', name: 'Medreseja', lat: 41.33825893777831, lng: 19.82616394412093 },
  { id: 'selvia_stop1', name: 'Selvia', lat: 41.33307708029375, lng: 19.82274624415947 },
  { id: 'selvia_stop2', name: 'Selvia', lat: 41.333447783398825, lng: 19.823062071729957 },

  // ── LINJA 15B: Kombinat – Tufinë ───────────────────────────────────────────
  { id: 'rruga_arberit', name: 'Rruga Arberit', lat: 41.36987385402107, lng: 19.855007364435117 },
  { id: 'xhamia_stop1', name: 'Xhamia', lat: 41.36707736969902, lng: 19.853757919194276 },
  { id: 'xhamia_stop2', name: 'Xhamia', lat: 41.367363007437, lng: 19.85407095872192 },
  { id: 'varrezat_tufine_stop1', name: 'Varrezat Tufinë', lat: 41.36146770728299, lng: 19.85172356502851 },
  { id: 'varrezat_tufine_stop2', name: 'Varrezat Tufinë', lat: 41.36150320385792, lng: 19.851951025404713 },
  { id: 'instituti_ndertimit_stop1', name: 'Instituti Ndertimit', lat: 41.35971422542996, lng: 19.850161118049343 },
  { id: 'instituti_ndertimit_stop2', name: 'Instituti Ndertimit', lat: 41.35966858571836, lng: 19.85041785550367 },
  { id: 'elez_isufi_stop1', name: 'Elez Isufi', lat: 41.35733811816766, lng: 19.847518931768512 },
  { id: 'elez_isufi_stop2', name: 'Elez Isufi', lat: 41.35731614269344, lng: 19.847656308827407 },
  { id: 'profarma_stop1', name: 'Profarma', lat: 41.354076913522356, lng: 19.84614223953766 },
  { id: 'profarma_stop2', name: 'Profarma', lat: 41.35498592719514, lng: 19.84670084112889 },
  { id: 'shefqet_kuka_stop1', name: 'Shefqet Kuka', lat: 41.35230724140207, lng: 19.845126730423065 },
  { id: 'shefqet_kuka_stop2', name: 'Shefqet Kuka', lat: 41.35217608152568, lng: 19.845252027071574 },
  { id: 'ura_gjorices_stop1', name: 'Ura Gjorices', lat: 41.35037350277216, lng: 19.84386707921066 },
  { id: 'ura_gjorices_stop2', name: 'Ura Gjorices', lat: 41.35007061760878, lng: 19.843887770400325 },

  //── LINJA 15B: Kombinat – Tufinë ───────────────────────────────────────────
  { id: 'farmacia_10_orar', name: 'Farmacia 10', lat: 41.339657482728626, lng: 19.829279728824417 },
  { id: 'farmacia_10_antiorar', name: 'Farmacia 10', lat: 41.339478797870434, lng: 19.82964636211673 },
  { id: 'cajupi_orar', name: 'Cajupi', lat: 41.33652801212278, lng: 19.83142807128291 },
  { id: 'cajupi_antiorar', name: 'Cajupi', lat: 41.33776436414307, lng: 19.830810583632697 },
  { id: 'odise_paskali_orar', name: 'Odhise Paskali', lat: 41.335158606229, lng: 19.832355549447712 },
  { id: 'odise_paskali_antiorar', name: 'Odhise Paskali', lat: 41.33430710628102, lng: 19.833161936092566 },
  { id: 'bryli_antiorar', name: 'Brryli', lat: 41.33117407920379, lng: 19.834340440679547 },
  { id: 'shallvaret', name: 'Shallvaret', lat: 41.32379075147708, lng: 19.817893141248348 },
  { id: 'vellazerit_frasheri', name: 'Vellezerit Frasheri', lat: 41.32337545055907, lng: 19.818774030688935 },
  { id: 'drejtoria_e_policise_a', name: 'Drejtoria e Policise A', lat: 41.32296306821319, lng: 19.81274012981296 },
  { id: 'kinema_agimi', name: 'Kinema Agimi', lat: 41.322742551980156, lng: 19.814707449563617 },
  { id: 'gjykata', name: 'Gjykata', lat: 41.32205002728075, lng: 19.806850071287958 },
  { id: 'vasil_shanto_orar', name: 'Vasil Shanto A', lat: 41.32147203611153, lng: 19.806664689577822 },
  { id: 'sabaudin_gabrani_orar', name: 'Sabaudin Gabrani', lat: 41.32501218348803, lng: 19.803922714106687 },
  { id: 'sabaudin_gabrani_antiorar', name: 'Sabaudin Gabrani', lat: 41.32500105344963, lng: 19.803675252780803 },
  { id: 'inxhinieria_orar', name: 'Inxhinieria', lat: 41.328610672791434, lng: 19.802676078863207 },
  { id: 'inxhinieria_antiorar', name: 'Inxhinieria', lat: 41.32742845111803, lng: 19.802614034003525 },
  { id: 'karl_topia_orar', name: 'Karl Topia', lat: 41.33190020350803, lng: 19.80438182013802 },
  { id: 'karl_topia_antiorar', name: 'Karl Topia', lat: 41.33219144381092, lng: 19.804231744574345 },



];

export const BUS_ROUTES = [
  // ── LINJA 1A: Allias – Selitë ─────────────────────────────────────────────
  {
    id: 'L1A', name: '1A', label: 'Allias – Selitë', color: '#e63946',
    stops: [
      'allias', 'kopshti_27_stop2', 'parafabrikatet_stop2', 'bajram_curri_stop2', 'shkolla_bashkuar_stop2',
      'mjekesia_stop2', 'qsut_stop2', 'tregu_5_maji_stop2', 'dispanseria_stop2', 'shkencat_natyres',
      'muzeu_kombetar', 'shallvaret', 'brigada_8', 'rruga_moskat', 'posta_8_stop2',
      'komuna_parisit_stop2', 'tish_daija', 'dhimiter_shuteriqi', 'qendra_kristal_1', 'selite'
    ],
    returnStops: [
      'selite', 'rrapo_hekali', 'nenkalimi', 'qendra_kristal_2', 'prokop_mima',
      'lulishtja', 'stadiumi_dinamo', 'lulishte_cajupi', 'drejtoria_e_policise_b',
      'parku_rinia', 'kateshet_a', 'stacioni_i_trenit', 'shkencat_natyres',
      'dispanseria_stop1', 'tregu_5_maji_stop1', 'qsut_stop1', 'mjekesia_stop1', 'shkolla_bashkuar_stop1',
      'bajram_curri_stop1', 'parafabrikatet_stop1', 'kopshti_27_stop1', 'allias'
    ]
  },

  // ── LINJA 1B: Allias – Kodra e Diellit ─────────────────────────────────────
  {
    id: 'L1B', name: '1B', label: 'Allias – Kodra e Diellit', color: '#f3797b',
    stops: [
      'allias', 'kopshti_27_stop2', 'parafabrikatet_stop2', 'bajram_curri_stop2', 'shkolla_bashkuar_stop2',
      'mjekesia_stop2', 'qsut_stop2', 'tregu_5_maji_stop2', 'dispanseria_stop2', 'shkencat_natyres',
      'muzeu_kombetar', 'shallvaret', 'brigada_8', 'rruga_moskat', 'posta_8_stop2',
      'komuna_parisit_stop2', 'tish_daija', 'dhimiter_shuteriqi', 'qendra_kristal_1',
      'mentor_xhemali_stop2', 'rexhep_pinari_stop2', 'kodra_diellit_2'
    ],
    returnStops: [
      'kodra_diellit_2', 'rexhep_pinari_stop1', 'mentor_xhemali_stop1', 'rrapo_hekali', 'nenkalimi', 'qendra_kristal_2', 'prokop_mima',
      'lulishtja', 'stadiumi_dinamo', 'lulishte_cajupi', 'drejtoria_e_policise_b',
      'parku_rinia', 'kateshet_a', 'stacioni_i_trenit', 'shkencat_natyres',
      'dispanseria_stop1', 'tregu_5_maji_stop1', 'qsut_stop1', 'mjekesia_stop1', 'shkolla_bashkuar_stop1',
      'bajram_curri_stop1', 'parafabrikatet_stop1', 'kopshti_27_stop1', 'allias'
    ]
  },

  // ── LINJA 2: Terminali Juglindor – Stacioni i Trenit ────────────────────────
  {
    id: 'L2', name: '2', label: 'Terminali Juglindor – Stacioni i Trenit', color: '#ed8bb8',
    stops: [
      'terminal_jugilor', 'teg', 'tuneli', 'liqeni_i_thate_stop1', 'rruga_peti',
      'kopshti_zoologjik_stop1', 'rruga_kosovareve_stop1', 'petro_nini_luarasi',
      'libri_universitar_stop1', 'piramida1', 'biblioteka', 'stacioni_i_trenit'
    ],
    returnStops: [
      'stacioni_i_trenit', 'biblioteka', 'piramida2', 'libri_universitar_stop2', 'sheshi_wilson',
      'rruga_kosovareve_stop2', 'kopshti_zoologjik_stop2',
      'liqeni_i_thate_stop2', 'tuneli', 'teg', 'terminal_jugilor'
    ]
  },

  // ── LINJA 3A: Kashar Orar ───────────────────────────────────────────────────
  {
    id: 'L3A', name: '3A', label: 'Kashar Orar', color: '#7ecce4',
    stops: [
      'banka_shqiperise_a', 'kisha_katolike_a', 'poliklinika_9_a', 'ndre_mjeda', 'ura_teknologjike_a',
      'tregu_a', 'kombinati_mishit_a', 'joklin_persi_a', 'bego_hoxha_a', 'besim_alla_a',
      'yzberisht_a', 'pallati_minierave_a', 'ish_xhenio_a', 'mezez_a', 'serat_a',
      'erzen_lita_a', 'loni_ligori_a', 'njesia_kashar_a', 'nexho_konomi', 'kristaq_mone',
      'lumi_lane_a', 'sheshi_shqiponja_a', 'blloku_gintash_a', 'pallatet_arabe_a',
      'ana_komena', 'asllan_rusi_r_a', 'qemal_stafa', 'banka_shqiperise_a'
    ]
  },

  // ── LINJA 3B: Kashar Antiorar ──────────────────────────────────────────────
  {
    id: 'L3B', name: '3B', label: 'Kashar Antiorar', color: '#7ecce4',
    stops: [
      'biblioteka', 'mine_peza', 'asllan_rusi_r', 'pandi_dardha',
      'pallatet_arabe', 'blloku_gintash', 'sheshi_shqiponja', 'lumi_lane', 'aleksandri_madh',
      'kryqezimi_kashar', 'tom_plezhra', 'njesia_kashar', 'loni_ligori', 'erzen_lita',
      'serat', 'mezez', 'ish_xhenio', 'pallati_minierave', 'yzberisht', 'besim_alla',
      'bego_hoxha', 'joklin_persi', 'kombinati_mishit', 'kthesa_yzberisht_stop1', 'tregu',
      'ura_teknologjike', 'myhedin_llagami', 'poliklinika_9', 'kisha_katolike',
      'banka_e_shqiperise', 'biblioteka'
    ]
  },

  // ── LINJA 3C: Qendër - Yrshek ──────────────────────────────────────────────
  {
    id: 'L3C', name: '3C', label: 'Qendër – Yrshek', color: '#749bc2',
    stops: [
      'biblioteka', 'pesembedhjete_kateshet', 'banka_shqiperise_a', 'kisha_katolike_a',
      'poliklinika_9_a', 'ndre_mjeda', 'ura_teknologjike_a', 'tregu_a', 'kombinati_mishit_a',
      'joklin_persi_a', 'bego_hoxha_a', 'besim_alla_a', 'yzberisht_a',
      'pallati_minierave_a', 'ish_xhenio_a', 'mezez_a', 'top_channel_stop1',
      'radio_planet_stop1', 'pasqyra_stop1', 'rruga_demokracia_stop1', 'xhamia_yrshek_stop1', 'fusha_sportit_stop1', '100_vjetori'
    ],
    returnStops: [
      '100_vjetori', 'fusha_sportit_stop2', 'xhamia_yrshek_stop2', 'rruga_demokracia_stop2', 'pasqyra_stop2',
      'radio_planet_stop2', 'top_channel_stop2', 'mezez', 'ish_xhenio', 'pallati_minierave',
      'yzberisht', 'besim_alla', 'bego_hoxha', 'joklin_persi', 'kombinati_mishit', 'kthesa_yzberisht_stop1', 'tregu', 'ura_teknologjike',
      'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise', 'biblioteka'
    ]
  },

  // ── LINJA 4: Qendër – City Park ──────────────────────────────────────────
  {
    id: 'L4', name: '4', label: 'Qendër – City Park', color: '#a62639',
    stops: [
      'muzeu_kombetar', 'mine_peza', 'asllan_rusi_r', 'pandi_dardha', 'pallatet_arabe',
      'blloku_gintash', 'kthesa_kamzes', 'tregu_ushqimor_stop1', 'shkolla_stop1',
      'at_zef_pellumbi_stop1', 'gryka_kacanikut_stop1',
      'qtu_stop1', 'yrshek_stop1', 'domje_stop1', 'dpshtrr_stop1', 'mbikalimi_stop1',
      'dpm_stop1', 'radio_stacioni_stop1',
      'megatek_stop1', 'qafe_kashar_stop1', 'ura_limuthit_stop1', 'city_park'
    ],
    returnStops: [
      'city_park', 'ura_limuthit_stop2', 'qafe_kashar_stop2', 'megatek_stop2', 'radio_stacioni_stop2',
      'dpm_stop2', 'mbikalimi_stop2', 'dpshtrr_stop2', 'domje_stop2', 'yrshek_stop2', 'qtu_stop2',
      'gryka_kacanikut_stop2',
      'at_zef_pellumbi_stop2', 'shkolla_stop2', 'tregu_ushqimor_stop2', 'terminali_b', 'blloku_gintash_a',
      'pallatet_arabe_a', 'ana_komena', 'asllan_rusi_r_a', 'qemal_stafa',
      'dollari', 'muzeu_kombetar'
    ]
  },

  // ── LINJA 5A: Qendër – Uzina Autotraktori ──────────────────────────────────
  {
    id: 'L5A', name: '5A', label: 'Qendër – Uzina Autotraktori', color: '#7ca18d',
    stops: [
      'lanabregas', 'autotraktoret_stop1', 'banesat_sociale_stop1', 'rruga_spahiu_stop1', 'novruz_qosja_stop1',
      'pallatet_shkoze_stop1', 'ura_shkoze_stop1', 'poligrafiku_stop1', 'markata_stop1', 'dali_ndreu_stop1',
      'kushtrimi_lirise_stop1', 'sheshi_cameria_stop1', 'ali_demi_stop1', 'sheshi_ali_demi',
      'leopold_berthold', 'brryli', 'ministria_jashtme', 'atsh',
      'kateshet_a'
    ],
    returnStops: [
      'kateshet_a', 'dollari', 'parku_rinia', 'shkolla_baletit', '1_maji',
      'ali_demi_stop2', 'sheshi_cameria_stop2', 'kushtrimi_lirise_stop2', 'dali_ndreu_stop2', 'markata_stop2',
      'poligrafiku_stop2', 'ura_shkoze_stop2', 'pallatet_shkoze_stop2', 'novruz_qosja_stop2', 'rruga_spahiu_stop2',
      'banesat_sociale_stop2', 'autotraktoret_stop2', 'lanabregas',
    ]
  },

  // ── LINJA 5B: Qendër – Institut ─────────────────────────────────────────────
  {
    id: 'L5B', name: '5B', label: 'Qendër – Institut', color: '#218c54',
    stops: [
      'instituti_bujqesor', 'koder_kamez_stop2', 'ura_paskuqanit_stop2', 'treshi_stop2', 'rruga_kastriotet_stop2',
      'terminali_c', 'blloku_gintash_a', 'pallatet_arabe_a', 'ana_komena', 'asllan_rusi_r',
      'qemal_stafa', 'gjethja'
    ],
    returnStops: [
      'muzeu_kombetar', 'mine_peza', 'qemal_stafa', 'asllan_rusi_r', 'ana_komena',
      'pallatet_arabe', 'blloku_gintash', 'terminali_a', 'rruga_kastriotet_stop1', 'treshi_stop1',
      'ura_paskuqanit_stop1', 'koder_kamez_stop1', 'instituti_bujqesor'
    ]
  },

  // ── LINJA 6: Qendër – Laprakë ─────────────────────────────────────────────
  {
    id: 'L6', name: '6', label: 'Qendër – Laprakë', color: '#e02b74',
    stops: [
      'pesembedhjete_kateshet', 'mine_peza', 'vizion_plus_stop1',
      'rruga_muzaket_stop1', 'ptuu_stop1', 'administrativja_stop1', 'spitali_ushtarak_stop1', 'laprake_stop1',
      'aleks_buda_stop1', 'gjergj_legisi', 'ndoc_martini', 'pas_nenkalimit', 'shinat_e_trenit_stop1', 'skender_luarasi_stop1',
      'mark_bajraktari_stop1', 'isuf_uka_stop1', 'gjergj_fishta_stop2', 'zyhdi_herri_stop1', 'nikolle_ivanaj_stop1', 'kole_jakova_stop1',
      'gjoke_doci_stop2', 'isuf_xhelili_stop1', 'rruga_devolli_stop1', 'kamez',
    ],
    returnStops: [
      'kamez', 'rruga_devolli_stop2', 'isuf_xhelili_stop2', 'gjoke_doci_stop1', 'kole_jakova_stop2', 'nikolle_ivanaj_stop2', 'princ_vidi',
      'zyhdi_herri_stop2', 'gjergj_fishta_stop1', 'isuf_uka_stop2', 'mark_bajraktari_stop2', 'skender_luarasi_stop2',
      'shinat_e_trenit_stop2', 'vangjel_noti', 'aleks_buda_stop2', 'laprake_stop2', 'spitali_ushtarak_stop2',
      'administrativja_stop2', 'ptuu_stop2', 'rruga_muzaket_stop2', 'vizion_plus_stop2', 'don_bosko',
      'harry_fultz', 'stacioni_i_trenit', 'barrikadat', 'pesembedhjete_kateshet'
    ]
  },

  // ── LINJA 8A: Qendër – Terminali Juglindor ──────────────────────────────────
  {
    id: 'L8A', name: '8A', label: 'Qendër – Terminali Juglindor', color: '#5d59a6',
    stops: [
      'terminal_jugilor', 'teg', 'haxhi_dushku_stop1', 'panorama_liqenit_stop1', 'hamid_dalipi_stop1',
      'policia_ushtarake_stop1', 'rethrrotullimi', 'deshmoret',
      'haki_shehu', 'vilat_gjermane_stop1', 'filologjiku_stop1', 'liceu_artistik_stop1', 'posta_1_stop1',
      'kateshet_a', 'dollari'
    ],
    returnStops: [
      'dollari', 'parlamenti', 'posta_1_stop2', 'liceu_artistik_stop2', 'filologjiku_stop2', 'vilat_gjermane_stop2',
      'haki_shehu', 'pallati_brigadave', 'rethrrotullimi', 'spitali_veterinar', 'policia_ushtarake_stop2',
      'hamid_dalipi_stop2', 'panorama_liqenit_stop2', 'haxhi_dushku_stop2', 'teg', 'terminal_jugilor'
    ]
  },

  // ── LINJA 8B: Qendër – Sanatorium ──────────────────────────────────
  {
    id: 'L8B', name: '8B', label: 'Qendër – Sanatorium', color: '#b7a2d4',
    stops: [
      'sanatoriumi', 'nuri_arapi_stop2', 'rethrrotullimi',
      'deshmoret', 'haki_shehu', 'vilat_gjermane_stop1', 'filologjiku_stop1', 'liceu_artistik_stop1',
      'posta_1_stop1', 'kateshet_a', 'dollari'
    ],
    returnStops: [
      'dollari', 'parlamenti', 'posta_1_stop2', 'liceu_artistik_stop2', 'filologjiku_stop2', 'vilat_gjermane_stop2',
      'haki_shehu', 'pallati_brigadave', 'rethrrotullimi', 'shefqet_ndroqi', 'nuri_arapi_stop1', 'sanatoriumi'
    ]
  },

  // ── LINJA 8C: Qendër – Sauk i Vjeter ─────────────────────────────
  {
    id: 'L8C', name: '8C', label: 'Qendër – Sauk i Vjeter', color: '#d9d2e9',
    stops: [
      'sauk_i_vjeter', 'ibrahim_braja', 'seit_bathorja', 'rethrrotullimi',
      'deshmoret', 'haki_shehu', 'vilat_gjermane_stop1', 'filologjiku_stop1', 'liceu_artistik_stop1',
      'posta_1_stop1', 'kateshet_a', 'dollari'
    ],
    returnStops: [
      'dollari', 'parlamenti', 'posta_1_stop2', 'liceu_artistik_stop2', 'filologjiku_stop2', 'vilat_gjermane_stop2',
      'haki_shehu', 'pallati_brigadave', 'rethrrotullimi_v', 'seit_bathorja',
      'ibrahim_braja', 'sauk_i_vjeter'
    ]
  },

  // ── LINJA 9A: Jordan Misja – Qytet Studenti ─────────────────────────────
  {
    id: 'L9A', name: '9A', label: 'Jordan Misja – Qytet Studenti', color: '#b8c734',
    stops: [
      'uzina_dinamo', 'rruga_sejdini_stop2', 'ali_progri_stop2',
      'rruga_vjosa_stop2', 'kolegji_stop2', 'burgu_stop2', 'shkencat_natyres', 'dollari', 'parlamenti',
      'posta_1_stop2', 'liceu_artistik_stop2', 'filologjiku_stop2', 'ekonomiku_stop1', 'godina_15_stop2',
      'godina_26_stop2', 'kompleksi_stop2', 'kristaq_capo_stop2', 'haki_gjici',
      'depo_ujit_a_stop2', 'binak_alia_stop2', 'collakut'
    ],
    returnStops: [
      'collakut', 'binak_alia_stop1', 'depo_ujit_a_stop1', 'naum_prifti',
      'kristaq_capo_stop1', 'kompleksi_stop1', 'godina_26_stop1', 'godina_15_stop1', 'ekonomiku_stop2',
      'filologjiku_stop1', 'liceu_artistik_stop1', 'posta_1_stop1', 'biblioteka',
      'materniteti', 'stacioni_trenit_p', 'burgu_stop1', 'rruga_vjosa_stop1', 'ali_progri_stop2',
      'rruga_sejdini_stop1', 'uzina_dinamo'
    ]
  },

  // ── LINJA 9B: Jordan Misja – Vilat Gjermane ─────────────────────────────
  {
    id: 'L9B', name: '9B', label: 'Jordan Misja – Vilat Gjermane', color: '#9b59b6',
    stops: [
      'uzina_dinamo', 'rruga_sejdini_stop2', 'ali_progri_stop2',
      'rruga_vjosa_stop2', 'kolegji_stop2', 'burgu_stop2', 'shkencat_natyres', 'dollari', 'parlamenti',
      'posta_1_stop2', 'liceu_artistik_stop2', 'filologjiku_stop2', 'vellezerit_kondi_stop1', 'ambasada_palestines_stop1',
      'jup_kastrati_stop1', 'bicaket_stop1', 'irfan_tershana_stop1', 'depo_ujit_a_stop2', 'binak_alia_stop2', 'collakut'
    ],
    returnStops: [
      'collakut', 'depo_ujit_a_stop1', 'binak_alia_stop1', 'irfan_tershana_stop2', 'bicaket_stop2',
      'jup_kastrati_stop2', 'ambasada_palestines_stop2', 'vellezerit_kondi_stop2',
      'filologjiku_stop1', 'liceu_artistik_stop1', 'posta_1_stop1', 'biblioteka',
      'materniteti', 'stacioni_trenit_p', 'burgu_stop1', 'rruga_vjosa_stop1', 'ali_progri_stop2',
      'rruga_sejdini_stop1', 'uzina_dinamo'
    ]
  },

  // ── LINJA 10A: Tiranë – Materniteti Ri ─────────────────────────────────────────
  {
    id: 'L10A', name: '10A', label: 'Tiranë – Materniteti Ri', color: '#43a047',
    stops: [
      'depo_ujit_b', 'pal_engjelli_stop1', 'teqi_tartari_stop1', 'ura_stop1', 'pasho_hysa',
      'selman_riza', 'odise_grillo', 'marteniteri_ri_a',
      'brryli', 'ministria_jashtme', 'atsh', 'biblioteka'
    ],
    returnStops: [
      'biblioteka', 'dollari', 'parlamenti', 'shkolla_baletit', 'sheshi_ali_demi',
      'ministria_shendetesise', 'leopold_berthold', 'marteniteri_ri', 'sabri_koci',
      'dhimiter_kamarda', 'ura_stop2',
      'teqi_tartari_stop2', 'pal_engjelli_stop2', 'depo_ujit_b'
    ]
  },

  // ── LINJA 10B: Qendër – Mihal Grameno ─────────────────────────────────────────
  {
    id: 'L10B', name: '10B', label: 'Qendër – Mihal Grameno', color: '#d1703e',
    stops: [
      'biblioteka', 'dollari', 'parlamenti', 'shkolla_baletit', 'njesia_2_stop2', 'tregu_elektrik_stop2',
      'mihal_grameno_stop2', 'abedin_pash_dino_stop2', 'kristaq_capo_stop2', 'haki_gjici',
      'depo_ujit_a_stop2', 'binak_alia_stop2', 'collakut'
    ],
    returnStops: [
      'collakut', 'binak_alia_stop1', 'depo_ujit_a_stop1', 'naum_prifti', 'kristaq_capo_stop1',
      'abedin_pash_dino_stop1', 'ali_visha', 'mihal_grameno_stop1', 'tregu_elektrik_stop1',
      'njesia_2_stop1', 'shkolla_baletit', 'biblioteka'
    ]
  },

  // ── LINJA 10C: Fusha e Aviacionit – Shkozë ──────────────────────────────────
  {
    id: 'L10C', name: '10C', label: 'Fusha e Aviacionit – Shkozë', color: '#ad7e4e',
    stops: [
      'dhora_leka', 'simon_gjoni_stop2', 'helikopteret_stop2', 'fusha_aviacionit_stop2', 'konviktet_stop2', 'zjarrefiksja_stop2',
      'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise', 'parlamenti', 'shkolla_baletit', 'sheshi_ali_demi',
      'ministria_shendetesise', 'leopold_berthold', 'marteniteri_ri', 'marketi',
      'kopshti_56', 'shkoze_stop1'
    ],
    returnStops: [
      'shkoze_stop2', 'selman_riza', 'odise_grillo', 'marteniteri_ri_a', 'brryli',
      'ministria_jashtme', 'atsh', 'biblioteka',
      'zjarrefiksja_stop1', 'konviktet_stop1', 'fusha_aviacionit_stop1', 'helikopteret_stop1', 'simon_gjoni_stop1', 'dhora_leka'
    ]
  },

  // ── LINJA 11: Porcelan – Qëndër ─────────────────────────────────────────────
  {
    id: 'L11', name: '11', label: 'Porcelan – Qëndër', color: '#2951dfff',
    stops: [
      'biblioteka', 'pazari_ri_stop1', 'optika_stop1', 'hoxha_tahsim_stop1', 'xhamlliku_stop1', 'varri_bamit_stop1',
      'oxhaku_l', 'artistike_migjeni_stop1', 'ikv_stop1', 'fresku_stop1', 'qendra_shendetesore',
      'kabina_elektrike', 'hysen_bastari', 'stacioni_shkolles_re', 'thesari'
    ],
    returnStops: [
      'thesari', '17_shkurti', 'bunkart_1', 'aziz_deliiu', 'thoma_filipeu',
      'fizika_berthamore', 'fresku_stop2', 'ikv_stop2', 'artistike_migjeni_stop2', 'varri_bamit_stop2',
      'xhamlliku_stop2', 'hoxha_tahsim_stop2', 'optika_stop2', 'pazari_ri_stop2', 'biblioteka'
    ]
  },

  // ── LINJA 12: Uzina Dinamo – Sharrë ────────────────────────────────────────
  {
    id: 'L12', name: '12', label: 'Uzina Dinamo – Sharrë', color: '#99d19c',
    stops: [
      'uzina_dinamo', 'ura_paskuqanit', 'asllan_lala', 'nenstacioni_elektrik', 'rruga_besa',
      'frigoriferi', 'siri_kodra_stop1', 'shkencat_natyres', 'banka_e_shqiperise', 'kisha_katolike',
      'poliklinika_9', 'ndre_mjeda', 'ura_teknologjike', 'tregu_a', 'kthesa_yzberisht_stop2',
      'misto_mame', 'ukt_stop2', 'mapo_stop2', 'kombinat_stop2', 'komisariati_6_stop2', 'varrezat_sharre_stop2',
      'kthesa_sharre_stop2', 'prush_stop2', 'fabrika_tullave_stop2', 'karburanti'
    ],
    returnStops: [
      'karburanti', 'fabrika_tullave_stop1', 'prush_stop1', 'kthesa_sharre_stop1', 'varrezat_sharre_stop1', 'komisariati_6_stop1',
      'kombinat_stop1', 'mapo_stop1', 'ukt_stop1', 'misto_mame', 'kthesa_yzberisht_stop1',
      'ura_teknologjike', 'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise',
      'shkencat_natyres', 'siri_kodra_stop2', 'frigoriferi', 'rruga_besa', 'nenstacioni_elektrik',
      'filip_jano', 'uzina_dinamo'
    ]
  },

  // ── LINJA 13A: Tirana e Re Orar ─────────────────────────────────────────────
  {
    id: 'L13A', name: '13A', label: 'Tirana e Re Orar', color: '#ba68c8',
    stops: [
      'muzeu_kombetar', 'parku_rinia', 'piramida1', 'libri_universitar_stop1', 'stadiumi_dinamo_stop2',
      'vasil_shanto_stop1', 'pallati_me_shigjeta_stop1', 'teodor_keko_stop1', 'kristaq_dollaku_stop1',
      'nexho_konomi', 'kristaq_mone', 'lumi_lane_a', 'sheshi_shqiponja_a', 'blloku_gintash_a',
      'pallatet_arabe_a', 'ana_komena', 'asllan_rusi_r_a', 'don_bosko', 'harry_fultz', 'shkencat_natyres', 'muzeu_kombetar'
    ]
  },

  // ── LINJA 13B: Tirana e Re Antiorar ──────────────────────────────────────────
  {
    id: 'L13B', name: '13B', label: 'Tirana e Re Antiorar', color: '#ba68c8',
    stops: [
      'pesembedhjete_kateshet', 'materniteti', 'harry_fultz_orar', 'don_bosko_orar',
      'asllan_rusi_r', 'pandi_dardha', 'pallatet_arabe', 'blloku_gintash', 'kthesa_kamzes', 'sheshi_shqiponja', 'lumi_lane',
      'aleksandri_madh', 'kryqezimi_kashar',
      'kristaq_dollaku_stop2', 'teodor_keko_stop2', 'pallati_me_shigjeta_stop2', 'vasil_shanto_stop2',
      'komuna_parisit_stop2', 'posta_8_stop1', 'libri_universitar_stop2', 'rektorati', 'piramida2', 'pesembedhjete_kateshet'
    ]
  },

  // ── LINJA 15A: Kombinat – Kinostudio ────────────────────────────────────────
  {
    id: 'L15A', name: '15A', label: 'Kombinat – Kinostudio', color: '#d35400',
    stops: [
      'kinostudio_stop1', 'rruga_ura_stop1', 'shkolla_bashkuar_stop2', 'mjekesia_stop2', 'qsut_stop2',
      'medreseja_stop1', 'selvia_stop1', 'banka_shqiperise_a', 'kisha_katolike_a',
      'poliklinika_9_a', 'ndre_mjeda', 'ura_teknologjike_a',
      'tregu_a', 'kthesa_yzberisht_stop2', 'misto_mame', 'ukt_stop2', 'mapo_stop2', 'kombinat_stop2'
    ],
    returnStops: [
      'kombinat_stop1', 'mapo_stop1', 'ukt_stop1', 'misto_mame', 'kthesa_yzberisht_stop1', 'tregu', 'ura_teknologjike',
      'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise',
      'kateshet_a',
      'selvia_stop2', 'medreseja_stop2', 'qsut_stop1', 'mjekesia_stop1', 'shkolla_bashkuar_stop1',
      'rruga_ura_stop2', 'kinostudio_stop2', 'aleksander_moisiu'
    ]
  },


  // ── LINJA 15B: Kombinat – Tufinë ───────────────────────────────────────────
  {
    id: 'L15B', name: '15B', label: 'Kombinat – Tufinë', color: '#f39c12',
    stops: [
      'rruga_arberit', 'xhamia_stop1', 'varrezat_tufine_stop1', 'instituti_ndertimit_stop1',
      'elez_isufi_stop1', 'profarma_stop1', 'shefqet_kuka_stop1', 'ura_gjorices_stop1', 'rruga_ura_stop1',
      'shkolla_bashkuar_stop2', 'mjekesia_stop2', 'qsut_stop2',
      'medreseja_stop1', 'selvia_stop1', 'banka_shqiperise_a', 'kisha_katolike_a',
      'poliklinika_9_a', 'ndre_mjeda', 'ura_teknologjike_a',
      'tregu_a', 'kthesa_yzberisht_stop2', 'misto_mame', 'ukt_stop2', 'mapo_stop2', 'kombinat_stop2'
    ],
    returnStops: [
      'kombinat_stop1', 'mapo_stop1', 'ukt_stop1', 'misto_mame', 'kthesa_yzberisht_stop1', 'tregu', 'ura_teknologjike',
      'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise',
      'kateshet_a',
      'selvia_stop2', 'medreseja_stop2', 'qsut_stop1', 'mjekesia_stop1', 'shkolla_bashkuar_stop1',
      'rruga_ura_stop2', 'ura_gjorices_stop2', 'shefqet_kuka_stop2', 'profarma_stop2',
      'elez_isufi_stop2', 'instituti_ndertimit_stop2', 'varrezat_tufine_stop2', 'xhamia_stop2', 'rruga_arberit'
    ]
  },

  // ── LINJA 16A: Linja e Gjelbër Orar ─────────────────────────────────────────
  {
    id: 'L16A', name: '16A', label: 'Linja e Gjelbër Orar', color: '#2ecc71',
    stops: [
      'karl_topia_orar', 'farmacia_10_orar', 'cajupi_orar', 'odise_paskali_orar',
      'bryli_orar', 'ish_ekspozita_orar', 'shallvaret', 'drejtoria_e_policise_a',
      'gjykata', 'sabaudin_gabrani_orar', 'inxhinieria_orar', 'karl_topia_orar'
    ]
  },

  // ── LINJA 16B: Linja e Gjelbër Antiorar ──────────────────────────────────────
  {
    id: 'L16B', name: '16B', label: 'Linja e Gjelbër Antiorar', color: '#2ecc71',
    stops: [
      'karl_topia_antiorar', 'inxhinieria_antiorar', 'sabaudin_gabrani_antiorar',
      'vasil_shanto_antiorar', 'kinema_agimi', 'vellazerit_frasheri', 'bryli_antiorar',
      'odise_paskali_antiorar', 'cajupi_antiorar', 'farmacia_10_antiorar', 'karl_topia_antiorar'
    ]
  },
];
