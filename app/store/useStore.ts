import { create } from 'zustand';

// ─── HARTA ZYRTARE E LINJAVE URBANE, TIRANË ──────────────────────────────────
// Bazuar në hartën zyrtare të Bashkisë Tiranë (25.07.2024)

export const BUS_STOPS = [
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

  { id: 'pesembedhjete_kateshet', name: '15 Katëshat', lat: 41.3298, lng: 19.8184 },

  // ── LINJA 3C: Qender - Yrshek ───────────────────────────────────────────── 
  { id: 'top_channel', name: 'Top Channel ', lat: 41.340910291422425, lng: 19.760677023177987 },
  { id: 'radio_planet', name: 'Radio Planet', lat: 41.34331663662546, lng: 19.75745360988623 },
  { id: 'pasqyra', name: 'Pasqyra', lat: 41.34597054630015, lng: 19.75383156070586 },
  { id: 'rruga_demokracia', name: 'Rruga Demokracia', lat: 41.34951375839497, lng: 19.747797401650853 },
  { id: 'xhamia', name: 'Xhamia', lat: 41.3509243423924, lng: 19.745291647356844 },
  { id: 'fusha_sportit', name: 'Fusha Sportit', lat: 41.3526422908893, lng: 19.741807701716255 },
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

];

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
    id: 'L8C', name: '8C', label: 'Qender - Sauk i Vjeter', color: '#bac3d5ff',
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

// ─── HELPER: Gjeneron autobuzë fillestar ────────────────────────────────────
const createBuses = () => {
  const buses: any[] = [];
  BUS_ROUTES.forEach((route) => {
    // Numri i autobuzëve varet nga gjatësia e linjës
    const busCount = Math.max(2, Math.min(4, Math.floor(route.stops.length / 3)));
    for (let i = 0; i < busCount; i++) {
      const direction = i % 2 === 0 ? 1 : -1;
      const stopIds = (direction === 1 || !route.returnStops) ? route.stops : route.returnStops;
      const stopIdx = Math.floor(Math.random() * (stopIds.length - 1));
      const stop = BUS_STOPS.find(s => s.id === stopIds[stopIdx]);
      if (!stop) continue;

      buses.push({
        id: `${route.id}-B${i + 1}`,
        routeId: route.id,
        routeColor: route.color,
        routeLabel: route.label,
        routeName: route.name,
        lat: stop.lat + (Math.random() - 0.5) * 0.0008,
        lng: stop.lng + (Math.random() - 0.5) * 0.0008,
        currentStopIdx: stopIdx,
        direction: direction,
        speed: 18 + Math.random() * 22,
        passengerLoad: Math.floor(Math.random() * 50),
        nextStop: BUS_STOPS.find(s => s.id === stopIds[Math.min(stopIdx + 1, stopIds.length - 1)])?.name || '',
        delay: Math.floor(Math.random() * 5),
        lastUpdate: Date.now(),
      });
    }
  });
  return buses;
};

// ─── STORE ───────────────────────────────────────────────────────────────────
const useStore = create((set: any, get: any) => ({
  // ── Auth ──
  user: { name: 'Admin', email: 'admin@busal.al', avatar: null },
  isAuthenticated: true,
  token: 'dev-token',
  login: (userData: any, token: any) => set({ user: userData, isAuthenticated: true, token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null, currentView: 'login' }),
  updateProfile: (data: any) => set((state: any) => ({ user: { ...state.user, ...data } })),

  // ── Language ──
  language: 'al',
  setLanguage: (lang: string) => set({ language: lang }),

  // ── Navigation ──
  currentView: 'map',
  isSidebarOpen: false,
  setView: (v: any) => set({ currentView: v, isSidebarOpen: false }),
  toggleSidebar: () => set((state: any) => ({ isSidebarOpen: !state.isSidebarOpen })),
  // ── Map Settings ──
  showStops: true,
  showRoutes: true,
  showBuses: true,
  setShowStops: (val: boolean) => set({ showStops: val }),
  setShowRoutes: (val: boolean) => set({ showRoutes: val }),
  setShowBuses: (val: boolean) => set({ showBuses: val }),

  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  // ── Buses ──
  buses: createBuses(),
  selectedBus: null,
  selectedRoute: null,
  userLocation: { lat: 41.3275, lng: 19.8187 },
  setUserLocation: (loc: { lat: number, lng: number }) => set({ userLocation: loc }),
  fetchUserLocation: () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        set({
          userLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  },
  findNearestStop: (lat: number, lng: number) => {
    let nearest = BUS_STOPS[0];
    let minDist = Infinity;
    BUS_STOPS.forEach(stop => {
      const dist = Math.sqrt(Math.pow(stop.lat - lat, 2) + Math.pow(stop.lng - lng, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = stop;
      }
    });
    return nearest;
  },
  setSelectedBus: (bus: any) => set({ selectedBus: bus }),
  setSelectedRoute: (route: any) => set({ selectedRoute: route }),
  selectedStop: null,
  setSelectedStop: (stop: any) => set({ selectedStop: stop }),

  // ── Traffic & Intelligence Logic ──
  trafficZones: [
    { id: 'tz1', name: 'Zogu i Zi', lat: 41.3323, lng: 19.8078, radius: 0.003, intensity: 0.8 }, // 80% vonesë
    { id: 'tz2', name: 'Qendra', lat: 41.3275, lng: 19.8187, radius: 0.004, intensity: 0.6 },
    { id: 'tz3', name: '21 Dhjetori', lat: 41.3265, lng: 19.8030, radius: 0.002, intensity: 0.7 },
  ],

  moveBuses: () => {
    const { buses, trafficZones } = get();
    const now = new Date();
    const hour = now.getHours();
    const isPeakHour = (hour >= 8 && hour <= 9) || (hour >= 16 && hour <= 18);

    const updated = buses.map((bus: any) => {
      const route = BUS_ROUTES.find(r => r.id === bus.routeId);
      if (!route) return bus;

      // Përcakto listën e stacioneve bazuar në drejtimin
      const stopIds = (bus.direction === 1 || !route.returnStops) ? route.stops : route.returnStops;
      const stops = stopIds.map(id => BUS_STOPS.find(s => s.id === id)).filter(Boolean);

      const nextIdx = bus.currentStopIdx + 1;

      // Nëse arriti në fund të njërës rrugë, kthehu në fillim të rrugës tjetër
      if (nextIdx >= stops.length) {
        return {
          ...bus,
          currentStopIdx: 0,
          direction: bus.direction === 1 ? -1 : 1,
          lastUpdate: Date.now()
        };
      }

      const target = stops[nextIdx];
      if (!target) return bus;

      // Logjika e Trafikut: Kontrollo nese autobuzi eshte ne nje zone trafiku
      let speedMultiplier = 1.0;
      trafficZones.forEach((zone: any) => {
        const distToZone = Math.sqrt(Math.pow(bus.lat - zone.lat, 2) + Math.pow(bus.lng - zone.lng, 2));
        if (distToZone < zone.radius) {
          speedMultiplier = 1.0 - zone.intensity;
        }
      });

      const dlat = target.lat - bus.lat;
      const dlng = target.lng - bus.lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);

      if (dist < 0.0003) {
        const arrivalIdx = nextIdx;

        // Simulimi i pasagjereve: Shto/Hiq pasagjere ne stacion
        let newLoad = bus.passengerLoad + (Math.floor(Math.random() * 11) - 5);
        if (isPeakHour) newLoad += Math.floor(Math.random() * 8); // Me shume njerez ne pik
        newLoad = Math.max(2, Math.min(50, newLoad));

        return {
          ...bus,
          currentStopIdx: arrivalIdx,
          lat: target.lat,
          lng: target.lng,
          passengerLoad: newLoad,
          delay: speedMultiplier < 0.5 ? (bus.delay + 1) : Math.max(0, bus.delay - 1),
          nextStop: stops[Math.min(arrivalIdx + 1, stops.length - 1)]?.name || '',
          lastUpdate: Date.now(),
        };
      }

      // Levizja me shpejtesi te ndryshueshme nga trafiku
      const baseStep = 0.00018;
      const actualStep = baseStep * speedMultiplier;

      return {
        ...bus,
        lat: bus.lat + (dlat / dist) * actualStep,
        lng: bus.lng + (dlng / dist) * actualStep,
        speed: 40 * speedMultiplier * (0.8 + Math.random() * 0.4), // km/h vizuale
      };
    });
    set({ buses: updated });
  },

  // ── Trip Planner ──
  tripResult: null,
  activeTrip: null,
  setActiveTrip: (trip: any) => set({ activeTrip: trip }),
  tripFrom: '',
  tripTo: '',
  setTripFrom: (v: any) => set({ tripFrom: v }),
  setTripTo: (v: any) => set({ tripTo: v }),
  planTrip: (fromName: string, toName: string) => {
    const from = BUS_STOPS.find(s => s.name.toLowerCase().includes(fromName.toLowerCase()));
    const to = BUS_STOPS.find(s => s.name.toLowerCase().includes(toName.toLowerCase()));
    if (!from || !to) {
      set({ tripResult: { error: 'Stacioni nuk u gjet. Provo me emër tjetër.' } });
      return;
    }

    // Kërko linjë direkte
    let legs: any[] = [];
    for (const route of BUS_ROUTES) {
      const fi = route.stops.indexOf(from.id);
      const ti = route.stops.indexOf(to.id);
      if (fi !== -1 && ti !== -1) {
        const stopsInBetween = route.stops.slice(Math.min(fi, ti), Math.max(fi, ti) + 1)
          .map(id => BUS_STOPS.find(s => s.id === id)?.name)
          .filter(Boolean);
        legs = [{
          route,
          stops: stopsInBetween,
          boardAt: from.name,
          alightAt: to.name,
          numStops: Math.abs(ti - fi),
        }];
        break;
      }
    }

    // Nëse nuk ka direkte, kërko me ndërrim (transfer)
    if (!legs.length) {
      for (const route1 of BUS_ROUTES) {
        const fi = route1.stops.indexOf(from.id);
        if (fi === -1) continue;
        for (const route2 of BUS_ROUTES) {
          if (route1.id === route2.id) continue;
          const ti = route2.stops.indexOf(to.id);
          if (ti === -1) continue;
          // Gjej stacion ndërrimi të përbashkët
          const transfer = route1.stops.find(id => route2.stops.includes(id) && id !== from.id && id !== to.id);
          if (transfer) {
            const transferStop = BUS_STOPS.find(s => s.id === transfer);
            legs = [
              { route: route1, boardAt: from.name, alightAt: transferStop?.name || transfer, transfer: true },
              { route: route2, boardAt: transferStop?.name || transfer, alightAt: to.name, transfer: false },
            ];
            break;
          }
        }
        if (legs.length) break;
      }
    }

    const travelTime = legs.length === 1
      ? (legs[0].numStops || 3) * 4
      : legs.length === 2 ? 30 : 20;

    set({
      tripResult: legs.length
        ? { from: from.name, to: to.name, legs, travelTime, totalPrice: legs.length > 1 ? 80 : 40 }
        : { error: 'Nuk u gjet rrugë. Provo destinacion tjetër.' }
    });
  },

  // ── Notifications ──
  notifications: [],
  addNotification: (msg: string, type = 'info') => {
    const id = Date.now();
    set((state: any) => ({ notifications: [...state.notifications, { id, msg, type }] }));
    setTimeout(() => set((state: any) => ({
      notifications: state.notifications.filter((n: any) => n.id !== id)
    })), 4500);
  },

  // ── Saved Routes ──
  savedRoutes: [],
  saveRoute: (route: any) => set((state: any) => ({
    savedRoutes: state.savedRoutes.find((r: any) => r.id === route.id)
      ? state.savedRoutes
      : [...state.savedRoutes, route]
  })),
  removeSavedRoute: (routeId: string) => set((state: any) => ({
    savedRoutes: state.savedRoutes.filter((r: any) => r.id !== routeId)
  })),

  // ── Filter ──
  activeFilter: 'all',
  setActiveFilter: (f: string) => set({ activeFilter: f }),
  searchQuery: '',
  setSearchQuery: (q: string) => set({ searchQuery: q }),
}));

export default useStore;