// ─── HARTA ZYRTARE E LINJAVE URBANE, TIRANË ──────────────────────────────────
// Bazuar në hartën zyrtare të Bashkisë Tiranë (25.07.2024)

export const BUS_STOPS = [
  { id: 'ndre_mjeda', name: 'Ndre Mjeda', lat: 41.32472, lng: 19.79653 },
  { id: 'bryli_orar', name: 'Brryli', lat: 41.33049805997018, lng: 19.83376871938563 },
  { id: 'ish_ekspozita_orar', name: 'Ish Ekspozita', lat: 41.3255, lng: 19.8145 },
  { id: 'vasil_shanto_antiorar', name: 'Vasil Shanto', lat: 41.320687204881224, lng: 19.805554735017974 },
  // Porcelani
  { id: 'biblioteka', name: 'Biblioteka Kombetare', lat: 41.328380772224, lng: 19.82098880092712 },
  { id: 'pazari_ri', name: 'Pazari i Ri', lat: 41.329073643100294, lng: 19.824475672613367 },
  { id: 'optika', name: 'Optika', lat: 41.33160739312691, lng: 19.82914808077014 },
  { id: 'hoxha_tahsim', name: 'Hoxha Tahsim', lat: 41.33336565645783, lng: 19.832744920860588 },
  { id: 'xhamlliku', name: 'Xhamlliku', lat: 41.335826769693675, lng: 19.83820542770278 },
  { id: 'varri_bamit', name: 'Varri i Bamit', lat: 41.33827623899169, lng: 19.841373521760392 },
  { id: 'oxhaku_l', name: 'Oxhaku L', lat: 41.33961129345346, lng: 19.84315125442063 },
  { id: 'artistike_migjeni_r', name: 'Artistike Migjeni R', lat: 41.342181906274625, lng: 19.84600432152968 },
  { id: 'artistike_migjeni_l', name: 'Artistike Migjeni L', lat: 41.34208726025871, lng: 19.845773651558957 },
  { id: 'fresku', name: 'Fresku', lat: 41.3461846334508, lng: 19.85522038159125 },
  { id: 'ikv', name: 'IKV', lat: 41.34517101892639, lng: 19.850844009155836 },
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
  { id: 'kopshti_27', name: 'Kopshti 27', lat: 41.34840374040633, lng: 19.833190558271294 },
  { id: 'parafabrikatet', name: 'Parafabrikatet', lat: 41.34666400897193, lng: 19.836763260608468 },
  { id: 'bajram_curri', name: 'Bajram Curri', lat: 41.346221014361646, lng: 19.838286755309618 },
  { id: 'shkolla_bashkuar', name: 'Shkolla Bashkuar', lat: 41.3441107077933, lng: 19.836269734172642 },
  { id: 'mjekesia', name: 'Mjekesia', lat: 41.341855342715284, lng: 19.832439539725485 },
  { id: 'qsut', name: 'QSUT', lat: 41.34067929991471, lng: 19.830207941827435 },
  { id: 'tregu_5_maji', name: 'Tregu 5 Maji', lat: 41.34008321531884, lng: 19.82540142327658 },
  { id: 'dispanseria', name: 'Dispanseria', lat: 41.33799687627965, lng: 19.821399567443546 },
  { id: 'shkencat_natyres', name: 'Shkencat e Natyres', lat: 41.33524183977649, lng: 19.816303370346546 },
  { id: 'muzeu_kombetar', name: 'Muzeu Kombetar', lat: 41.33017855214433, lng: 19.816646693093652 },
  { id: 'shallvaret', name: 'Shallvaret', lat: 41.32415468926219, lng: 19.817221613815853 },
  { id: 'brigada_8', name: 'Brigada 8', lat: 41.32160624514186, lng: 19.813570964750276 },
  { id: 'rruga_moskat', name: 'Rruga Moskat', lat: 41.31927419835486, lng: 19.81422126035806 },
  { id: 'posta_8', name: 'Posta 8', lat: 41.31821055912352, lng: 19.812893566903632 },
  { id: 'komuna_e_parisit', name: 'Komuna e Parisit', lat: 41.31864770083064, lng: 19.80768471700935 },
  { id: 'tish_daija', name: 'Tish Daija', lat: 41.31637684528332, lng: 19.805824141391753 },
  { id: 'dhimiter_shuteriqi', name: 'Dhimiter Shuteriqi', lat: 41.31446976262468, lng: 19.804236596303475 },
  { id: 'qendra_kristal_1', name: 'Qendra Kristal 1', lat: 41.31382247506085, lng: 19.80151550375448 },
  { id: 'selite', name: 'Selite', lat: 41.31543762185999, lng: 19.797475835407056 },
  { id: 'rrapo_hekali', name: 'Rrapo Hekali', lat: 41.31340856972316, lng: 19.801007820334256 },
  { id: 'nenkalimi', name: 'Nenkalimi', lat: 41.312122059723535, lng: 19.80456459660223 },
  { id: 'qendra_kristal_2', name: 'Qendra Kristal 2 ', lat: 41.31329257414136, lng: 19.80342599886747 },
  { id: 'prokop_mima', name: 'Prokop Mima ', lat: 41.31394525242991, lng: 19.80569610997833 },
  { id: 'lulishtja', name: 'Lulishtja ', lat: 41.31663587176773, lng: 19.80683016687634 },
  { id: 'stadiumi_dinamo', name: 'Stadiumi Dinamo', lat: 41.31928375251999, lng: 19.80837968959587 },
  { id: 'lulishte_cajupi', name: 'Lulishte Cajupi', lat: 41.322140948455164, lng: 19.81098877100529 },
  { id: 'drejtoria_e_policise_b', name: 'Drejtoria e Policise B', lat: 41.324700404209736, lng: 19.81282079885007 },
  { id: 'parku_rinia', name: 'Parku Rinia', lat: 41.32551442528089, lng: 19.816626424076563 },
  { id: 'kateshet_a', name: '9 Kateshet A', lat: 41.32940343895082, lng: 19.821476918928166 },
  { id: 'materniteti', name: 'Materniteti', lat: 41.33471972494674, lng: 19.81681413863808 },
  { id: 'stacioni_i_trenit', name: 'Stacioni i Trenit', lat: 41.33596882919001, lng: 19.817041584157213 },

  // ── LINJA 1B: Allias-Kodra e Diellit ─────────────────────────────────────────────
  { id: 'rexhep_pinari', name: 'Rexhep Pinari', lat: 41.310292761582375, lng: 19.798134271473064 },
  { id: 'kodra_diellit_2', name: 'Kodra e Diellit 2', lat: 41.30697284558859, lng: 19.798421102519683 },
  { id: 'mentor_xhemali', name: 'Mentor Xhemali', lat: 41.314031814375035, lng: 19.79840592841797 },

  // ── LINJA 2: Terminali Juglindor – Stacioni i Trenit ─────────────────────────────────────────────
  { id: 'terminal_jugilor', name: 'Terminali Juglindor ', lat: 41.283362180910885, lng: 19.855547708728487 },
  { id: 'teg', name: 'TEG ', lat: 41.28301273658262, lng: 19.858311742061524 },
  { id: 'tuneli', name: 'Tuneli ', lat: 41.30522471324829, lng: 19.82241895442661 },
  { id: 'liqeni_i_thate', name: 'Liqeni i Thate ', lat: 41.305321427733894, lng: 19.81583144914248 },
  { id: 'rruga_peti', name: 'Rruga Peti ', lat: 41.30706226337961, lng: 19.813342359225885 },
  { id: 'kopshti_zoologjik', name: 'Kopshti Zoologjik', lat: 41.30896423442469, lng: 19.811153676662514 },
  { id: 'rruga_kosovareve', name: 'Rruga Kosovareve', lat: 41.312590720330434, lng: 19.814801480859966 },
  { id: 'petro_nini_luarasi', name: 'Petro Nini Luarasi ', lat: 41.317475351271646, lng: 19.81485948421849 },
  { id: 'sheshi_wilson', name: 'Sheshi Wilson', lat: 41.3176526276786, lng: 19.814682458427008 },
  { id: 'libri_universitar', name: 'Libri Universitar ', lat: 41.31919168895222, lng: 19.81828198285922 },
  { id: 'rektorati', name: 'Rektorati ', lat: 41.317757381693184, lng: 19.821881507349662 },
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
  { id: 'besim_alla', name: 'Besim Alla ', lat: 41.324872706965984, lng: 19.773982209057884 },
  { id: 'bego_hoxha', name: 'Bego Hoxha ', lat: 41.32372052933106, lng: 19.776594680569744 },
  { id: 'joklin_persi', name: 'Joklin Persi', lat: 41.32339314737342, lng: 19.779115717984233 },
  { id: 'komabinati_mishit', name: 'Komabinati Mishit', lat: 41.322993585241534, lng: 19.781680864065752 },
  { id: 'kthesa_yzberisht', name: 'Kthesa Yzberisht', lat: 41.31988392403415, lng: 19.78434113980807 },
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
  { id: 'besim_alla_a', name: 'Besim Alla', lat: 41.324872706965984, lng: 19.773982209057884 },
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
  { id: 'xhamia_stop1', name: 'Xhamia', lat: 41.3509243423924, lng: 19.745291647356844 },
  { id: 'xhamia_stop2', name: 'Xhamia', lat: 41.351152811444734, lng: 19.744803039274053 },
  { id: 'fusha_sportit_stop1', name: 'Fusha Sportit', lat: 41.3526422908893, lng: 19.741807701716255 },
  { id: 'fusha_sportit_stop2', name: 'Fusha Sportit', lat: 41.35248168554631, lng: 19.74202427075276 },
  { id: '100_vjetori', name: '100 Vjetori', lat: 41.35308466650584, lng: 19.73797763024168 },

  // ── LINJA 4: Qender - City Park ──────────────────────────────────────────────
  { id: 'kthesa_kamzes', name: 'Kthesa Kamzes', lat: 41.34354167932628, lng: 19.776416274756958 },
  { id: 'shkolla', name: 'Shkolla', lat: 41.34698094868577, lng: 19.765233797800686 },
  { id: 'at_zef_pellumbi', name: 'At Zef Pellumbi', lat: 41.3479661225831, lng: 19.762124019362172 },
  { id: 'gryka_kacanikut', name: 'Gryka Kacanikut', lat: 41.35166235998139, lng: 19.751791116422606 },
  { id: 'qtu', name: 'QTU ', lat: 41.352618784265594, lng: 19.748807017300958 },
  { id: 'yrshek', name: 'Yrshek ', lat: 41.354747153946875, lng: 19.74294536329907 },
  { id: 'domje', name: 'Domje ', lat: 41.35840683316045, lng: 19.73236957710019 },
  { id: 'dpshtrr', name: 'DPSHTRr ', lat: 41.360310713857515, lng: 19.72686277391403 },
  { id: 'mbikalimi', name: 'Mbikalimi ', lat: 41.36173361257613, lng: 19.721825357181274 },
  { id: 'dpm', name: 'DPMN ', lat: 41.36268477680489, lng: 19.71816144888521 },
  { id: 'radio_stacioni', name: 'Radio Stacioni', lat: 41.36349431034081, lng: 19.714964577011862 },
  { id: 'megatek', name: 'Megatek', lat: 41.369376930864235, lng: 19.70660316414813 },
  { id: 'qafe_kashar', name: 'Qafe Kashar', lat: 41.36947098323661, lng: 19.699399897238823 },
  { id: 'ura_limuthit', name: 'Ura Limuthit', lat: 41.37093913153896, lng: 19.69154791760511 },
  { id: 'city_park', name: 'City Park', lat: 41.36716282826561, lng: 19.68873833986497 },
  { id: 'dollari', name: 'Dollari', lat: 41.327714735006666, lng: 19.81622172281785 },

  // ── LINJA 5A: Qender - Uzina Autotraktori ──────────────────────────────────────────────
  { id: 'lanabregas', name: 'Lanabregas', lat: 41.331611556034396, lng: 19.872421749988938 },
  { id: 'autotraktoret', name: 'Autotraktoret', lat: 41.33247878210308, lng: 19.867940168878853 },
  { id: 'banesat_sociale', name: 'Banesat Sociale', lat: 41.333205054306475, lng: 19.86497053539327 },
  { id: 'rruga_spahiu', name: 'Rruga Spahiu', lat: 41.33408161877719, lng: 19.863375098022033 },
  { id: 'novruz_qosja', name: 'Novruz Qosja', lat: 41.33457469821732, lng: 19.85806849675956 },
  { id: 'pallatet_shkoze', name: 'Pallatet Shkoze ', lat: 41.33471706589827, lng: 19.85418296379833 },
  { id: 'ura_shkoze', name: 'Ura Shkoze ', lat: 41.334160949049334, lng: 19.85197744048201 },
  { id: 'poligrafiku', name: 'Poligrafiku', lat: 41.33363003003347, lng: 19.84864465401347 },
  { id: 'markata', name: 'Markata', lat: 41.33264721498136, lng: 19.84627136390501 },
  { id: 'dali_ndreu', name: 'Dali Ndreu', lat: 41.330816716471695, lng: 19.843273512806075 },
  { id: 'kushtrimi_lirise', name: 'Kushtrimi Lirise ', lat: 41.33058633366243, lng: 19.839508312159182 },
  { id: 'sheshi_cameria', name: 'Sheshi Cameria', lat: 41.32774725039586, lng: 19.835604517599776 },
  { id: 'ali_demi', name: 'Ali Demi', lat: 41.3277929780918, lng: 19.831667553474247 },
  { id: 'sheshi_ali_demi', name: 'Sheshi Ali Demi', lat: 41.32797576482631, lng: 19.829355233644332 },
  { id: 'leopold_berthold', name: 'Leopold Berthold', lat: 41.32997785230052, lng: 19.83400899871404 },
  { id: 'brryli', name: 'Brryli', lat: 41.33049805997018, lng: 19.83376871938563 },
  { id: 'ministria_jashtme', name: 'Ministria Jashtme', lat: 41.329540299994456, lng: 19.831548788964813 },
  { id: 'atsh', name: 'ATSH', lat: 41.327342947344796, lng: 19.827200997543486 },
  { id: 'stacioni_kombetar', name: 'Stacioni Kombetar', lat: 41.325917971366446, lng: 19.824429053280594 },
  { id: 'parku_rinia', name: 'Parku Rinia', lat: 41.32503787671768, lng: 19.81917787572543 },
  { id: 'shkolla_baletit', name: 'Shkolla Baletit', lat: 41.32559112566621, lng: 19.82605642826449 },
  { id: '1_maji', name: '1 Maji', lat: 41.3277074950589, lng: 19.828931808915957 },

  // ── LINJA 5B: Qender - Institut ──────────────────────────────────────────────
  { id: 'instituti_bujqesor', name: 'Instituti Bujqesor', lat: 41.36083255621101, lng: 19.771838051295003 },
  { id: 'koder_kamez', name: 'Koder Kamez', lat: 41.35820733385693, lng: 19.77318988461347 },
  { id: 'ura_paskuqanit', name: 'Ura Paskuqanit', lat: 41.35515517837614, lng: 19.774455887253428 },
  { id: 'treshi', name: 'Treshi', lat: 41.351498845968656, lng: 19.770625692812846 },
  { id: 'rruga_kastriotet', name: 'Rruga Kastriotet', lat: 41.34701271261611, lng: 19.773994547314754 },
  { id: 'terminali_c', name: 'Terminali C', lat: 41.344334577244915, lng: 19.77595255988895 },
  { id: 'terminali_a', name: 'Terminali A', lat: 41.34445279903355, lng: 19.776194561850577 },
  { id: 'gjethja', name: 'Gjethja', lat: 41.36083255621101, lng: 19.771838051295003 },

  // ── LINJA 6: Qender - Laprake ──────────────────────────────────────────────
  { id: 'gjergj_legisi', name: 'Gjergj Legisi', lat: 41.34166069745681, lng: 19.788780427483033 },
  { id: 'ndoc_martini', name: 'Ndoc Martini', lat: 41.34697371019859, lng: 19.788794782307264 },
  { id: 'pas_nenkalimit', name: 'Pas Nenkalimit', lat: 41.34693599256988, lng: 19.788091397966657 },
  { id: 'shinat_e_trenit', name: 'Shinat e Trenit', lat: 41.34470803200807, lng: 19.787674726890753 },
  { id: 'skender_luarasi', name: 'Skender Luarasi', lat: 41.346017937134434, lng: 19.783849914577715 },
  { id: 'mark_bajraktari', name: 'Mark Bajraktari', lat: 41.34686676989234, lng: 19.78211231539332 },
  { id: 'isuf_uka', name: 'Isuf Uka', lat: 41.34865567560045, lng: 19.77968369963706 },
  { id: 'gjergj_fishta', name: 'Gjergj Fishta', lat: 41.35128066693434, lng: 19.77262945783171 },
  { id: 'vangjel_noti', name: 'Vangjel Noti', lat: 41.34287313715884, lng: 19.788443090116633 },
  { id: 'aleks_buda', name: 'Aleks Buda', lat: 41.33986085654715, lng: 19.790201550947984 },
  { id: 'laprake', name: 'Laprake', lat: 41.338326941927136, lng: 19.793156171648068 },
  { id: 'spitali_ushtarak', name: 'Spitali Ushtarak', lat: 41.34168425516299, lng: 19.795039099935188 },
  { id: 'administrativja', name: 'Administrativja', lat: 41.34224511146635, lng: 19.79860881210787 },
  { id: 'ptuu', name: 'PTUU', lat: 41.340964910531966, lng: 19.80163127044123 },
  { id: 'rruga_muzaket', name: 'Rruga Muzaket', lat: 41.33904141814152, lng: 19.80292714447871 },
  { id: 'vizion_plus', name: 'Vizion Plus', lat: 41.3376540348853, lng: 19.803796178999725 },
  { id: 'don_bosko', name: 'Don Bosko', lat: 41.33444689219681, lng: 19.80751901369489 },
  { id: 'harry_fultz', name: 'Harry Fultz', lat: 41.33516059868827, lng: 19.81184857816006 },

  // ── LINJA 8A: Qender - Termiali Juglindor
  { id: 'haxhi_dushku', name: 'Haxhi Dushku', lat: 41.29378811785776, lng: 19.852843051329582 },
  { id: 'panorama_liqenit', name: 'Panorama Liqenit', lat: 41.299118266014645, lng: 19.850775338307834 },
  { id: 'hamid_dalipi', name: 'Hamid Dalipi', lat: 41.30105850597988, lng: 19.847750426377903 },
  { id: 'policia_ushtarake', name: 'Policia Ushtarake', lat: 41.30553800482398, lng: 19.843179971346952 },
  { id: 'spitali_veterinar', name: 'Spitali Veterinar', lat: 41.30681051653605, lng: 19.841124433342774 },
  { id: 'rethrrotullimi', name: 'Rrethrotullimi', lat: 41.30763112840011, lng: 19.839525907259503 },
  { id: 'pallati_brigadave', name: 'Pallati Brigadave', lat: 41.30868342407209, lng: 19.83711438695522 },
  { id: 'deshmoret', name: 'Deshmoret', lat: 41.311263759532316, lng: 19.836233475380496 },
  { id: 'haki_shehu', name: 'Haki Shehu', lat: 41.3145963722296, lng: 19.8345027897041 },
  { id: 'vilat_gjermane', name: 'Vilat Gjermane', lat: 41.317180874800485, lng: 19.833025712182227 },
  { id: 'filologjiku', name: 'Filologjiku', lat: 41.31889154102206, lng: 19.82896532779203 },
  { id: 'liceu_artistik', name: 'Liceu Artistik', lat: 41.321378019064554, lng: 19.825760216205527 },
  { id: 'posta_1', name: 'Posta 1', lat: 41.32426258437683, lng: 19.82514406267624 },
  { id: 'parlamenti', name: 'Parlamenti', lat: 41.32692813651838, lng: 19.823870839687565 },

  // ── LINJA 8B: Qender – Sanatorium ───────────────────
  { id: 'sanatoriumi', name: 'Sanatoriumi', lat: 41.31373717735935, lng: 19.844684115793758 },
  { id: 'nuri_arapi', name: 'Nuri Arapi', lat: 41.309420397669754, lng: 19.844084738183795 },
  { id: 'shefqet_ndroqi', name: 'Shefqet Ndroqi', lat: 41.307493944249366, lng: 19.841179860340926 },
  { id: 'zona_industriale', name: 'Zona Industriale', lat: 41.307493944249366, lng: 19.841179860340926 },

  // ── LINJA 8C: Qender - Sauk i Vjeter ─────────────────────────────
  { id: 'sauk_i_vjeter', name: 'Sauk i Vjeter', lat: 41.29951840101403, lng: 19.830051972087595 },
  { id: 'ibrahim_braja', name: 'Ibrahim Braja', lat: 41.30129748983332, lng: 19.831617635875567 },
  { id: 'seit_bathorja', name: 'Seit Bathorja', lat: 41.3032707019727, lng: 19.835061647209113 },
  { id: 'rethrrotullimi_v', name: 'Rrethrotullimi', lat: 41.30722631194845, lng: 19.84001447917246 },

  // ── LINJA 9A: Jordan Misja - Qyteti Studentit ─────────────────────────────
  { id: 'collakut', name: 'Collakut', lat: 41.320677563630305, lng: 19.854775796094252 },
  { id: 'binak_alia', name: 'Binak Alia', lat: 41.321062314496736, lng: 19.853340814299667 },
  { id: 'depo_ujit_a', name: 'Depo Ujit A', lat: 41.322376591652635, lng: 19.849827033328026 },
  { id: 'naum_prifti', name: 'Naum Prifti', lat: 41.321291795697725, lng: 19.844741926029382 },
  { id: 'haki_gjici', name: 'Haki Gjici', lat: 41.32126762302041, lng: 19.8449725960001 },
  { id: 'kristaq_capo', name: 'Kristaq Capo', lat: 41.321012717949614, lng: 19.843464807492197 },
  { id: 'kompleksi', name: 'Kompleksi', lat: 41.3205321483864, lng: 19.839740696688764 },
  { id: 'godina_26', name: 'Godina 26', lat: 41.32139910588096, lng: 19.83615788945764 },
  { id: 'godina_15', name: 'Godina 15', lat: 41.31990800611366, lng: 19.83492212883135 },
  { id: 'ekonomiku', name: 'Ekonomiku', lat: 41.31887299306676, lng: 19.831235501511372 },
  { id: 'stacioni_trenit_p', name: 'Stacioni Trenit', lat: 41.33579240948087, lng: 19.81477323137428 },
  { id: 'burgu', name: 'Burgu', lat: 41.33699973522266, lng: 19.81199631092415 },
  { id: 'kolegji', name: 'Kolegji', lat: 41.33914454866746, lng: 19.81085814023273 },
  { id: 'rruga_vjosa', name: 'Rruga Vjosa', lat: 41.34091634852547, lng: 19.810385197742928 },
  { id: 'ali_progri', name: 'Ali Progri', lat: 41.343769940699346, lng: 19.80873756533525 },
  { id: 'rruga_sejdini', name: 'Rruga Sejdini', lat: 41.34570700023389, lng: 19.807832640534794 },
  { id: 'uzina_dinamo', name: 'Uzina Dinamo', lat: 41.347355009810556, lng: 19.80668811733669 },

  // ── LINJA 9B: Jordan Misja - Vilat Gjermane ─────────────────────────────
  { id: 'irfan_tershana', name: 'Irfan Tershana', lat: 41.3182123935054, lng: 19.845708512329114 },
  { id: 'bicaket', name: 'Bicaket', lat: 41.31744425273962, lng: 19.84293989974941 },
  { id: 'jup_kastrati', name: 'Jup Kastrati', lat: 41.316565921178764, lng: 19.839968012183615 },
  { id: 'ambasada_palestines', name: 'Ambasada Palestines', lat: 41.316667744340485, lng: 19.836429634377495 },
  { id: 'vellezerit_kondi', name: 'Vellezerit Kondi', lat: 41.31713363121546, lng: 19.834540601477556 },

  // ── LINJA 10A: Qender – Marteniteti Ri ─────────────────────────────────────────
  { id: 'depo_ujit_b', name: 'Depo Ujit B', lat: 41.32438156582706, lng: 19.849880475371332 },
  { id: 'pal_engjelli', name: 'Pal Engjelli', lat: 41.32757001015527, lng: 19.84890144314062 },
  { id: 'teqi_tartari', name: 'Teki Tartari', lat: 41.32848647452588, lng: 19.847199935686987 },
  { id: 'ura', name: 'Ura', lat: 41.32984149719154, lng: 19.845285754489325 },
  { id: 'pasho_hysa', name: 'Pasho Hysa', lat: 41.33140235874708, lng: 19.844555943232628 },
  { id: 'sabri_koci', name: 'Sabri Koci', lat: 41.332650356687424, lng: 19.84387519278399 },
  { id: 'selman_riza', name: 'Selman Riza', lat: 41.333081559109345, lng: 19.84343242531492 },
  { id: 'odise_grillo', name: 'Odhise Grillo', lat: 41.33326500703079, lng: 19.840592877346463 },
  { id: 'marteniteri_ri_a', name: 'Marteniteri Ri', lat: 41.331806840749444, lng: 19.83677877616114 },
  { id: 'ministria_shendetesise', name: 'Ministria Shendetesise', lat: 41.32925035509754, lng: 19.83235464049404 },
  { id: 'marteniteri_ri', name: 'Marteniteri Ri', lat: 41.3315772580336, lng: 19.837695572642023 },

  // ── LINJA 10B: Qender – Mihal Grameno ─────────────────────────────────────────
  { id: 'abedin_pash_dino', name: 'Abedin Pashe Dino', lat: 41.32207940004562, lng: 19.840065007549434 },
  { id: 'ali_visha', name: 'Ali Visha', lat: 41.32342585854858, lng: 19.837304750597436 },
  { id: 'mihal_grameno', name: 'Mihal Grameno', lat: 41.32411397654377, lng: 19.835232771383204 },
  { id: 'tregu_elektrik', name: 'Tregu Elektrik', lat: 41.32563792454284, lng: 19.833239219510606 },
  { id: 'njesia_2', name: 'Njesia 2', lat: 41.32570603991613, lng: 19.829979848513055 },
  { id: 'shkolla_baletit', name: 'Shkolla Baletit', lat: 41.32542079554202, lng: 19.827040364701368 },

  // ── LINJA 10C: Fusha Aviacionit – Shkoze ─────────────────────────────────────────────
  { id: 'marketi', name: 'Marketi', lat: 41.3326996597304, lng: 19.840995050759343 },
  { id: 'kopshti_56', name: 'Kopshti 56', lat: 41.3331615403104, lng: 19.844889989171563 },
  { id: 'shkoze_stop1', name: 'Shkoze', lat: 41.33391513985811, lng: 19.849070638819303 },
  { id: 'shkoze_stop2', name: 'Shkoze', lat: 41.33441863770382, lng: 19.849291921058654 },
  { id: 'zjarrefiksja', name: 'Zjarrefiksja', lat: 41.32817273499537, lng: 19.80048506735022 },
  { id: 'konviktet', name: 'Konviktet', lat: 41.3293090400562, lng: 19.800584982493266 },
  { id: 'fusha_aviacionit_stop1', name: 'Fusha Aviacionit', lat: 41.33021433494017, lng: 19.79745047693554 },
  { id: 'fusha_aviacionit_stop2', name: 'Fusha Aviacionit', lat: 41.33002064500143, lng: 19.797315900668536 },
  { id: 'helikopteret', name: 'Helikopteret', lat: 41.3314646986075, lng: 19.794531631919703 },
  { id: 'simon_gjoni', name: 'Simon Gjoni', lat: 41.333321405691045, lng: 19.79120040869184 },
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
  { id: 'ukt', name: 'UKT', lat: 41.317792250369955, lng: 19.77726844409436 },
  { id: 'mapo', name: 'Mapo', lat: 41.31577988545304, lng: 19.771461745610516 },
  { id: 'kombinat', name: 'Kombinat', lat: 41.3142061334698, lng: 19.76761191947786 },
  { id: 'komisariati_6', name: 'Komisariati 6', lat: 41.31271529507327, lng: 19.763904610856333 },
  { id: 'varrezat_sharre', name: 'Varrezat Sharre', lat: 41.31049383822419, lng: 19.759550762690342 },
  { id: 'kthesa_sharre', name: 'Kthesa Sharre', lat: 41.306682129689676, lng: 19.757215918373024 },
  { id: 'prush', name: 'Prush', lat: 41.30569804048908, lng: 19.75449031508163 },
  { id: 'fabrika_tullave', name: 'Fabrika Tullave', lat: 41.304903948127674, lng: 19.750717975372414 },
  { id: 'karburanti', name: 'Karburanti', lat: 41.30326232377927, lng: 19.745399579714498 },
  { id: 'filip_jano', name: 'Filip Jano', lat: 41.345013852832125, lng: 19.808752845785687 },

  // ── LINJA 13A: Tirana e Re Orar ─────────────────────────────────────────────
  { id: 'komuna_parisit_stop2', name: 'Komuna Parisit', lat: 41.31877300236136, lng: 19.808346342666322 },
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

];

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

  // ── LINJA 3A: Kashar Orar ───────────────────────────────────────────────────
  {
    id: 'L3A', name: '3A', label: 'Kashar Orar', color: '#7ecce4',
    stops: [
      'banka_shqiperise_a', 'kisha_katolike_a', 'poliklinika_9_a', 'ura_teknologjike_a',
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
      'bego_hoxha', 'joklin_persi', 'komabinati_mishit', 'kthesa_yzberisht', 'tregu',
      'ura_teknologjike', 'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise', 'biblioteka'
    ]
  },

  // ── LINJA 3C: Qendër - Yrshek ──────────────────────────────────────────────
  {
    id: 'L3C', name: '3C', label: 'Qendër – Yrshek', color: '#749bc2',
    stops: [
      'biblioteka', 'pesembedhjete_kateshet', 'banka_shqiperise_a', 'kisha_katolike_a',
      'poliklinika_9_a', 'ura_teknologjike_a', 'tregu_a', 'kombinati_mishit_a',
      'joklin_persi_a', 'bego_hoxha_a', 'besim_alla_a', 'yzberisht_a',
      'pallati_minierave_a', 'ish_xhenio_a', 'mezez_a', 'top_channel_stop1',
      'radio_planet_stop1', 'pasqyra_stop1', 'rruga_demokracia_stop1', 'xhamia_stop1', 'fusha_sportit_stop1', '100_vjetori'
    ],
    returnStops: [
      '100_vjetori', 'fusha_sportit_stop2', 'xhamia_stop2', 'rruga_demokracia_stop2', 'pasqyra_stop2',
      'radio_planet_stop2', 'top_channel_stop2', 'mezez', 'ish_xhenio', 'pallati_minierave',
      'yzberisht', 'besim_alla', 'bego_hoxha', 'joklin_persi', 'kombinati_mishit', 'tregu', 'ura_teknologjike',
      'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise', 'biblioteka'
    ]
  },

  // ── LINJA 4: Qendër – City Park ──────────────────────────────────────────
  {
    id: 'L4', name: '4', label: 'Qendër – City Park', color: '#a62639',
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
      'pallatet_arabe_a', 'ana_komena', 'asllan_rusi_r_a', 'qemal_stafa',
      'dollari', 'muzeu_kombetar'
    ]
  },

  // ── LINJA 5A: Qendër – Uzina Autotraktori ──────────────────────────────────
  {
    id: 'L5A', name: '5A', label: 'Qendër – Uzina Autotraktori', color: '#7ca18d',
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

  // ── LINJA 5B: Qendër – Institut ─────────────────────────────────────────────
  {
    id: 'L5B', name: '5B', label: 'Qendër – Institut', color: '#218c54',
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

  // ── LINJA 6: Qendër – Laprakë ─────────────────────────────────────────────
  {
    id: 'L6', name: '6', label: 'Qendër – Laprakë', color: '#e02b74',
    stops: [
      'pesembedhjete_kateshet', 'materniteti', 'harry_fultz', 'don_bosko', 'vizion_plus',
      'rruga_muzaket', 'ptuu', 'administrativja', 'spitali_ushtarak', 'laprake',
      'aleks_buda', 'gjergj_fishta', 'gjergj_legisi', 'vangjel_noti', 'shinat_e_trenit', 'skender_luarasi',
      'mark_bajraktari', 'isuf_uka'
    ],
    returnStops: [
      'gjergj_fishta', 'isuf_uka', 'mark_bajraktari', 'skender_luarasi', 'shinat_e_trenit',
      'vangjel_noti', 'gjergj_legisi', 'aleks_buda', 'laprake', 'spitali_ushtarak',
      'administrativja', 'ptuu', 'rruga_muzaket', 'vizion_plus', 'don_bosko',
      'harry_fultz', 'stacioni_i_trenit', 'pesembedhjete_kateshet'
    ]
  },

  // ── LINJA 8A: Qendër – Terminali Juglindor ──────────────────────────────────
  {
    id: 'L8A', name: '8A', label: 'Qendër – Terminali Juglindor', color: '#5d59a6',
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

  // ── LINJA 8B: Qendër – Sanatorium ──────────────────────────────────
  {
    id: 'L8B', name: '8B', label: 'Qendër – Sanatorium', color: '#b7a2d4',
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

  // ── LINJA 8C: Qendër – Sauk i Vjeter ─────────────────────────────
  {
    id: 'L8C', name: '8C', label: 'Qendër – Sauk i Vjeter', color: '#d9d2e9',
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

  // ── LINJA 9A: Jordan Misja – Qytet Studenti ─────────────────────────────
  {
    id: 'L9A', name: '9A', label: 'Jordan Misja – Qytet Studenti', color: '#b8c734',
    stops: [
      'biblioteka', 'materniteti', 'stacioni_trenit_p', 'burgu', 'rruga_vjosa',
      'ali_progri', 'rruga_sejdini', 'uzina_dinamo', 'rruga_sejdini', 'ali_progri',
      'rruga_vjosa', 'kolegji', 'burgu', 'shkencat_natyres', 'dollari', 'parlamenti',
      'posta_1', 'liceu_artistik', 'filologjiku', 'ekonomiku', 'godina_15',
      'godina_26', 'kompleksi', 'kristaq_capo', 'haki_gjici', 'naum_prifti',
      'depo_ujit_a', 'binak_alia', 'collakut'
    ],
    returnStops: [
      'collakut', 'binak_alia', 'depo_ujit_a', 'naum_prifti', 'haki_gjici',
      'kristaq_capo', 'kompleksi', 'godina_26', 'godina_15', 'ekonomiku',
      'filologjiku', 'liceu_artistik', 'posta_1', 'parlamenti', 'dollari',
      'shkencat_natyres', 'burgu', 'kolegji', 'rruga_vjosa', 'ali_progri',
      'rruga_sejdini', 'uzina_dinamo', 'rruga_sejdini', 'ali_progri',
      'rruga_vjosa', 'burgu', 'stacioni_trenit_p', 'materniteti', 'biblioteka'
    ]
  },

  // ── LINJA 9B: Jordan Misja – Vilat Gjermane ─────────────────────────────
  {
    id: 'L9B', name: '9B', label: 'Jordan Misja – Vilat Gjermane', color: '#9b59b6',
    stops: [
      'biblioteka', 'materniteti', 'stacioni_trenit_p', 'burgu', 'rruga_vjosa',
      'ali_progri', 'rruga_sejdini', 'uzina_dinamo', 'rruga_sejdini', 'ali_progri',
      'rruga_vjosa', 'kolegji', 'burgu', 'shkencat_natyres', 'dollari', 'parlamenti',
      'posta_1', 'liceu_artistik', 'filologjiku', 'vellezerit_kondi', 'ambasada_palestines',
      'jup_kastrati', 'bicaket', 'irfan_tershana'
    ],
    returnStops: [
      'irfan_tershana', 'bicaket', 'jup_kastrati', 'ambasada_palestines', 'vellezerit_kondi',
      'filologjiku', 'liceu_artistik', 'posta_1', 'parlamenti', 'dollari',
      'shkencat_natyres', 'burgu', 'kolegji', 'rruga_vjosa', 'ali_progri',
      'rruga_sejdini', 'uzina_dinamo', 'rruga_sejdini', 'ali_progri',
      'rruga_vjosa', 'burgu', 'stacioni_trenit_p', 'materniteti', 'biblioteka'
    ]
  },

  // ── LINJA 10A: Tiranë – Materniteti Ri ─────────────────────────────────────────
  {
    id: 'L10A', name: '10A', label: 'Tiranë – Materniteti Ri', color: '#43a047',
    stops: [
      'depo_ujit_b', 'pal_engjelli', 'teqi_tartari', 'ura', 'pasho_hysa',
      'sabri_koci', 'selman_riza', 'odise_grillo', 'marteniteri_ri_a',
      'brryli', 'ministria_jashtme', 'atsh', 'biblioteka'
    ],
    returnStops: [
      'biblioteka', 'dollari', 'parlamenti', 'shkolla_baletit', 'sheshi_ali_demi',
      'ministria_shendetesise', 'leopold_berthold', 'marteniteri_ri',
      'pasho_hysa', 'ura',
      'teqi_tartari', 'pal_engjelli', 'depo_ujit_b'
    ]
  },

  // ── LINJA 10B: Qendër – Mihal Grameno ─────────────────────────────────────────
  {
    id: 'L10B', name: '10B', label: 'Qendër – Mihal Grameno', color: '#d1703e',
    stops: [
      'biblioteka', 'dollari', 'parlamenti', 'shkolla_baletit', 'njesia_2', 'tregu_elektrik',
      'mihal_grameno', 'ali_visha', 'abedin_pash_dino', 'kristaq_capo', 'haki_gjici',
      'naum_prifti', 'depo_ujit_a', 'binak_alia', 'collakut'
    ],
    returnStops: [
      'collakut', 'binak_alia', 'depo_ujit_a', 'naum_prifti', 'haki_gjici', 'kristaq_capo',
      'abedin_pash_dino', 'ali_visha', 'mihal_grameno', 'tregu_elektrik',
      'njesia_2', 'shkolla_baletit', 'biblioteka'
    ]
  },

  // ── LINJA 10C: Fusha e Aviacionit – Shkozë ──────────────────────────────────
  {
    id: 'L10C', name: '10C', label: 'Fusha e Aviacionit – Shkozë', color: '#ad7e4e',
    stops: [
      'dhora_leka', 'simon_gjoni', 'helikopteret', 'fusha_aviacionit_stop2', 'konviktet', 'zjarrefiksja',
      'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise', 'parlamenti', 'shkolla_baletit', 'sheshi_ali_demi',
      'ministria_shendetesise', 'leopold_berthold', 'marteniteri_ri', 'marketi',
      'kopshti_56', 'shkoze_stop1'
    ],
    returnStops: [
      'shkoze_stop2', 'selman_riza', 'odise_grillo', 'marteniteri_ri_a', 'brryli',
      'ministria_jashtme', 'atsh', 'biblioteka',
      'zjarrefiksja', 'konviktet', 'fusha_aviacionit_stop2', 'helikopteret', 'simon_gjoni', 'dhora_leka'
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

  // ── LINJA 12: Uzina Dinamo – Sharrë ────────────────────────────────────────
  {
    id: 'L12', name: '12', label: 'Uzina Dinamo – Sharrë', color: '#99d19c',
    stops: [
      'uzina_dinamo', 'ura_paskuqanit', 'asllan_lala', 'nenstacioni_elektrik', 'rruga_besa',
      'frigoriferi', 'siri_kodra_stop1', 'shkencat_natyres', 'banka_e_shqiperise', 'kisha_katolike',
      'poliklinika_9', 'ndre_mjeda', 'ura_teknologjike',
      'misto_mame', 'ukt', 'mapo', 'kombinat', 'komisariati_6', 'varrezat_sharre',
      'kthesa_sharre', 'prush', 'fabrika_tullave', 'karburanti'
    ],
    returnStops: [
      'karburanti', 'fabrika_tullave', 'prush', 'kthesa_sharre', 'varrezat_sharre', 'komisariati_6',
      'kombinat', 'mapo', 'ukt', 'misto_mame',
      'ura_teknologjike', 'ndre_mjeda', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise',
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
      'kinostudio_stop1', 'rruga_ura_stop1', 'shkolla_bashkuar', 'mjekesia', 'qsut',
      'medreseja_stop1', 'selvia_stop1', 'banka_shqiperise_a', 'kisha_katolike_a',
      'poliklinika_9_a', 'myhedin_llagami', 'ndre_mjeda', 'ura_teknologjike_a',
      'tregu_a', 'kthesa_yzberisht', 'misto_mame', 'ukt', 'mapo', 'kombinat'
    ],
    returnStops: [
      'kombinat', 'mapo', 'ukt', 'misto_mame', 'kthesa_yzberisht', 'tregu', 'ura_teknologjike',
      'ndre_mjeda', 'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise',
      'kateshet_a',
      'selvia_stop2', 'medreseja_stop2', 'qsut', 'mjekesia', 'shkolla_bashkuar',
      'rruga_ura_stop2', 'kinostudio_stop2', 'aleksander_moisiu'
    ]
  },

  // ── LINJA 15B: Kombinat – Tufinë ───────────────────────────────────────────
  {
    id: 'L15B', name: '15B', label: 'Kombinat – Tufinë', color: '#f39c12',
    stops: [
      'rruga_arberit', 'xhamia_stop1', 'varrezat_tufine_stop1', 'instituti_ndertimit_stop1',
      'elez_isufi_stop1', 'profarma_stop1', 'shefqet_kuka_stop1', 'ura_gjorices_stop1', 'rruga_ura_stop1', 'shkolla_bashkuar', 'mjekesia', 'qsut',
      'medreseja_stop1', 'selvia_stop1', 'banka_shqiperise_a', 'kisha_katolike_a',
      'poliklinika_9_a', 'myhedin_llagami', 'ndre_mjeda', 'ura_teknologjike_a',
      'tregu_a', 'kthesa_yzberisht', 'misto_mame', 'ukt', 'mapo', 'kombinat'
    ],
    returnStops: [
      'kombinat', 'mapo', 'ukt', 'misto_mame', 'kthesa_yzberisht', 'tregu', 'ura_teknologjike',
      'ndre_mjeda', 'myhedin_llagami', 'poliklinika_9', 'kisha_katolike', 'banka_e_shqiperise',
      'kateshet_a',
      'selvia_stop2', 'medreseja_stop2', 'qsut', 'mjekesia', 'shkolla_bashkuar',
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
