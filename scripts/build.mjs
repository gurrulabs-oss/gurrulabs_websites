// Generates every static page from the registry in scripts/pages.mjs (one entry per page, 4 locales each):
// /<lang>/index.html, /<lang>/pulse/index.html and the Pulse content pages (test, age guide, 3 s challenge),
// plus root index.html, sitemap.xml, robots.txt and llms.txt. Canonical, hreflang, language switcher, sitemap, llms.txt
// and JSON-LD all derive from the registry. Copy: T (home/pulse + shared labels) and CONTENT (content pages).
// Run from anywhere: `node scripts/build.mjs`. Deterministic (no dates, no randomness). node: built-ins only.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, LOCALES, HREFLANG, PAGES, path, url } from './pages.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OG_LOCALE = { en: 'en_US', es: 'es_ES', fr: 'fr_FR', pt: 'pt_BR' };
const BADGE_ALT = { en: 'Get it on Google Play', es: 'Disponible en Google Play', fr: 'Disponible sur Google Play', pt: 'Disponível no Google Play' };
const SHOT_ALT = { en: 'Pulse screenshot', es: 'Captura de Pulse', fr: 'Capture de Pulse', pt: 'Captura do Pulse' };
const PKG = { pulse: 'com.gurrulabs.pulse', raffy: 'com.gurrulabs.raffy', cyberpunk_detective: 'com.gurrulabs.miniaicrimes' };

// ── Copy. Test strings and mode names/rules are the Pulse app's own (strings.xml); card one-liners come from the app Leads.
//    Functions are turned into "{a}" templates for the browser (see `i18n`).
const T = {
  en: {
    home_h1: 'Small apps that do <em>one thing</em> well.', kick: 'Independent Android app studio',
    about_big: 'One person. <em>One small problem per app.</em>', close_h: 'Start with three seconds.',
    close_p: 'Try to stop the clock at exactly 3.00 s, right here in your browser.', raffy_chips: ['Feed · 08:40', 'Sleep · 1h 25m', 'Growth · 6.2 kg'],
    home_p: 'Gurrulabs is a one-person studio making games and tools for Android. Each app has its own page here: see what it does, try it in your browser where you can, then get it on Google Play.',
    see_apps: 'See the apps', apps_h: 'Our apps', apps_p: 'Four apps, four very different jobs.', apps_word: 'Apps',
    cat: ['Game · Reaction time', 'Parenting · Baby tracker', 'Game · Detective mysteries', 'Sleep · Tinnitus'],
    pulse_page: 'Pulse page',
    about_h: 'Who we are', about_p: 'Gurrulabs is one developer designing, building and looking after every app. No big team, no features for their own sake: each app starts from one small problem and stays focused on it.',
    pri: [['Small on purpose', 'One job per app, done properly.'], ['Try it first', 'Where we can, you play or read on the web before you install.'], ['Calm by design', 'No clutter: each app gets out of your way.']],
    pulse_short: 'Stop the clock on the hundredth. Test your reaction time and reflexes.',
    pulse_cta: 'Try it in your browser',
    raffy_p: 'Log feeds, sleep and growth in seconds, with WHO charts.', raffy_cta: 'Visit raffyparenting.com',
    cyber_p: 'Solve neon-noir crime cases and catch the culprit.', lull_p: 'Sleep sounds and a daily diary so tinnitus bothers you less.',
    soon: 'Coming soon',
    p_kicker: 'Reaction time challenge', p_h1: 'Stop the clock at exactly 3.00 s', facts: ['No account', 'Works offline'],
    t_exact: 'Exact Time', t_react: 'Reaction', start: 'Start', stop: 'Stop', stop_at: 'Stop at', of: t => `of ${t} s`,
    h_exact: 'Pass within ±0.10 s. Perfect to the hundredth.', h_react: 'Tap anywhere when the lights go out', wait: 'Wait for lights out', too_soon: 'Too soon', reaction: 'reaction',
    perfect: 'Perfect', pass: 'Pass', early: 'Too early', late: 'Too late', false_start: 'False start', slow: 'Too slow',
    d_perfect: 'Dead on. 0.00 s off.', d_pass: (a, late) => `${a} s ${late ? 'late' : 'early'}`, d_miss: (a, late) => `${a} s ${late ? 'past' : 'before'} the window`,
    d_rperf: a => `Lightning. ${a} s inside perfect.`, d_rpass: a => `${a} s off perfect.`, d_rslow: a => `${a} s over the limit.`, d_false: 'You tapped before the lights went out.',
    win: 'Pass window ±0.10', rwin: 'Perfect to 0.30, pass under 0.40',
    beat: t => `Beat ${t} s in Pulse`, train: 'Train it in Pulse', again: 'Try again',
    beatx: a => `Beat ${a} s off in Pulse`, keep: 'Keep it perfect in Pulse',
    more: 'More targets, a hidden clock and a daily challenge in the app.', more_false: 'Wait for all the lights to go out.',
    modes_h: 'Train your sense of time', modes_p: 'Short games, real precision.',
    m: [['Exact Time', 'Stop on the target, clock visible'], ['Hidden Clock', 'Same, but the clock disappears'], ['Interval', 'Guess the time between two signals'], ['Reaction', 'Tap the moment the lights go out'], ['Batak', 'Hit the lit targets, fast']],
    shots_h: 'Inside the app', band_h: 'Your best is waiting', band_p: 'Pick up where the browser test stops.',
    nojs: 'The browser test needs JavaScript. The full game is in Pulse.', back: 'Gurrulabs', contact: 'Contact',
    pub: 'Published', upd: 'Updated', src_h: 'Sources', keep_h: 'Keep testing', bc: 'Breadcrumb',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], date: (d, m, y) => `${d} ${m} ${y}`,
    home_title: 'Gurrulabs: independent Android app studio',
    home_desc: 'Gurrulabs is a one-person studio making games and tools for Android: Pulse, Raffy, Cyberpunk Detective and Lull. Try Pulse in your browser.',
    pulse_title: 'Pulse app: reflex and timing game for Android | Gurrulabs',
    pulse_desc: 'Pulse is a reflex and sense-of-time game for Android: 5 modes, no account, works offline. Try two of its modes right in your browser.',
    guides_h: 'Tests and guides', guides_p: 'Play in your browser or read what the studies say.', read_h: 'Keep reading', faq_h: 'FAQ', edu: 'Educational content.', edu_med: 'Educational content, not medical advice.',
    foot: ['Reaction test', '3 s challenge', 'Reaction by age', 'Best reflex apps'], pulse_card: ['The Pulse app', 'Five modes to train'], read: n => `${n} min read`,
  },
  es: {
    home_h1: 'Apps pequeñas que hacen <em>una cosa</em> bien.', kick: 'Estudio independiente de apps Android',
    about_big: 'Una persona. <em>Un problema pequeño por app.</em>', close_h: 'Empieza con tres segundos.',
    close_p: 'Intenta parar el reloj en 3.00 s exactos, aquí mismo en el navegador.', raffy_chips: ['Toma · 08:40', 'Sueño · 1 h 25 min', 'Peso · 6,2 kg'],
    home_p: 'Gurrulabs es un estudio de una sola persona que crea juegos y herramientas para Android. Cada app tiene aquí su propia página: mira qué hace, pruébala en el navegador cuando se pueda y descárgala en Google Play.',
    see_apps: 'Ver las apps', apps_h: 'Nuestras apps', apps_p: 'Cuatro apps, cuatro trabajos muy distintos.', apps_word: 'Apps',
    cat: ['Juego · Tiempo de reacción', 'Crianza · Registro del bebé', 'Juego · Misterios de detectives', 'Sueño · Acúfenos'],
    pulse_page: 'Página de Pulse',
    about_h: 'Quiénes somos', about_p: 'Gurrulabs es una sola persona que diseña, programa y cuida cada app. Sin un gran equipo ni funciones de relleno: cada app nace de un problema pequeño y se centra en él.',
    pri: [['Pequeñas a propósito', 'Una tarea por app, bien hecha.'], ['Pruébalas antes', 'Cuando se puede, juegas o lees en la web antes de instalar.'], ['Tranquilas por diseño', 'Sin ruido: cada app te deja a lo tuyo.']],
    pulse_short: 'Para el reloj en la centésima. Pon a prueba tu tiempo de reacción y reflejos.',
    pulse_cta: 'Pruébalo en el navegador',
    raffy_p: 'Registra tomas, sueño y crecimiento en segundos, con curvas OMS.', raffy_cta: 'Visitar raffyparenting.com',
    cyber_p: 'Resuelve crímenes en una ciudad de neón y atrapa al culpable.', lull_p: 'Sonidos para dormir y un diario para que el acúfeno moleste menos.',
    soon: 'Próximamente',
    p_kicker: 'Reto de tiempo de reacción', p_h1: 'Para el reloj en 3.00 s exactos', facts: ['Sin cuenta', 'Funciona sin conexión'],
    t_exact: 'Exact Time', t_react: 'Reacción', start: 'Iniciar', stop: 'Parar', stop_at: 'Para en', of: t => `de ${t} s`,
    h_exact: 'Pasas con ±0.10 s. Perfecto a la centésima.', h_react: 'Toca donde quieras cuando se apaguen las luces', wait: 'Espera a que se apaguen', too_soon: 'Demasiado pronto', reaction: 'reacción',
    perfect: 'Perfecto', pass: 'Superado', early: 'Demasiado pronto', late: 'Demasiado tarde', false_start: 'Salida falsa', slow: 'Muy lento',
    d_perfect: 'Clavado. 0.00 s de diferencia.', d_pass: (a, late) => `${a} s ${late ? 'tarde' : 'antes'}`, d_miss: (a, late) => `${a} s ${late ? 'después' : 'antes'} del margen`,
    d_rperf: a => `Un rayo. ${a} s dentro de perfecto.`, d_rpass: a => `A ${a} s de perfecto.`, d_rslow: a => `${a} s por encima del límite.`, d_false: 'Tocaste antes de que se apagaran las luces.',
    win: 'Margen ±0.10', rwin: 'Perfecto hasta 0.30, pasa por debajo de 0.40',
    beat: t => `Supera ${t} s en Pulse`, train: 'Entrena en Pulse', again: 'Intentar otra vez',
    beatx: a => `Mejora esos ${a} s en Pulse`, keep: 'Sigue en perfecto en Pulse',
    more: 'Más objetivos, un reloj oculto y un reto diario en la app.', more_false: 'Espera a que se apaguen todas las luces.',
    modes_h: 'Entrena tu sentido del tiempo', modes_p: 'Partidas cortas, precisión real.',
    m: [['Exact Time', 'Para en el objetivo, con el reloj a la vista'], ['Hidden Clock', 'Igual, pero el reloj desaparece'], ['Intervalo', 'Calcula el tiempo entre dos señales'], ['Reacción', 'Toca justo cuando se apagan las luces'], ['Batak', 'Toca las luces encendidas, rápido']],
    shots_h: 'Dentro de la app', band_h: 'Tu mejor marca te espera', band_p: 'Sigue donde termina la prueba del navegador.',
    nojs: 'La prueba necesita JavaScript. El juego completo está en Pulse.', back: 'Gurrulabs', contact: 'Contacto',
    pub: 'Publicado', upd: 'Actualizado', src_h: 'Fuentes', keep_h: 'Sigue probando', bc: 'Ruta de navegación',
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'], date: (d, m, y) => `${d} de ${m} de ${y}`,
    home_title: 'Gurrulabs: estudio independiente de apps Android',
    home_desc: 'Gurrulabs es un estudio de una persona que crea juegos y herramientas para Android: Pulse, Raffy, Cyberpunk Detective y Lull. Prueba Pulse en el navegador.',
    pulse_title: 'App Pulse: juego de reflejos para Android | Gurrulabs',
    pulse_desc: 'Pulse es un juego de reflejos y sentido del tiempo para Android: 5 modos, sin cuenta y funciona sin conexión. Prueba dos de sus modos en el navegador.',
    guides_h: 'Pruebas y guías', guides_p: 'Juega en el navegador o aprende qué dicen los estudios.', read_h: 'Sigue leyendo', faq_h: 'Preguntas frecuentes', edu: 'Contenido educativo.', edu_med: 'Contenido educativo, no consejo médico.',
    foot: ['Test de reacción', 'Reto 3 s', 'Reacción por edad', 'Mejores apps de reflejos'], pulse_card: ['La app Pulse', 'Cinco modos para entrenar'], read: n => `Lectura de ${n} min`,
  },
  fr: {
    home_h1: 'De petites applis qui font <em>une seule chose</em>, et bien.', kick: 'Studio indépendant d’applis Android',
    about_big: 'Une personne. <em>Un petit problème par appli.</em>', close_h: 'Commence par trois secondes.',
    close_p: 'Essaie d’arrêter le chrono pile à 3.00 s, directement dans ton navigateur.', raffy_chips: ['Repas · 08:40', 'Sommeil · 1 h 25', 'Poids · 6,2 kg'],
    home_p: 'Gurrulabs est un studio d’une seule personne qui crée des jeux et des outils pour Android. Chaque appli a sa page ici : découvre ce qu’elle fait, essaie-la dans ton navigateur quand c’est possible, puis installe-la depuis Google Play.',
    see_apps: 'Voir les applis', apps_h: 'Nos applis', apps_p: 'Quatre applis, quatre usages très différents.', apps_word: 'Applis',
    cat: ['Jeu · Temps de réaction', 'Parentalité · Suivi bébé', 'Jeu · Enquêtes policières', 'Sommeil · Acouphènes'],
    pulse_page: 'Page de Pulse',
    about_h: 'Qui sommes-nous', about_p: 'Gurrulabs, c’est une seule personne qui conçoit, développe et entretient chaque appli. Pas de grande équipe ni de fonctions pour faire joli : chaque appli part d’un petit problème et s’y tient.',
    pri: [['Petites exprès', 'Une tâche par appli, bien faite.'], ['À essayer d’abord', 'Quand c’est possible, tu joues ou tu lis sur le web avant d’installer.'], ['Calmes par conception', 'Pas de fouillis : chaque appli te laisse tranquille.']],
    pulse_short: 'Arrête le chrono au centième. Teste ton temps de réaction et tes réflexes.',
    pulse_cta: 'Essaie-le dans ton navigateur',
    raffy_p: 'Note tétées, sommeil et croissance, avec les courbes de l’OMS.', raffy_cta: 'Aller sur raffyparenting.com',
    cyber_p: 'Résous des crimes dans une ville néon et trouve le coupable.', lull_p: 'Des sons pour dormir et un journal pour que l’acouphène gêne moins.',
    soon: 'Bientôt disponible',
    p_kicker: 'Défi de temps de réaction', p_h1: 'Arrête le chrono pile à 3.00 s', facts: ['Sans compte', 'Fonctionne hors ligne'],
    t_exact: 'Exact Time', t_react: 'Réaction', start: 'Démarrer', stop: 'Arrêter', stop_at: 'Arrête à', of: t => `sur ${t} s`,
    h_exact: 'Réussi à ±0.10 s près. Parfait au centième.', h_react: 'Touche n’importe où quand les feux s’éteignent', wait: 'Attends l’extinction', too_soon: 'Trop tôt', reaction: 'réaction',
    perfect: 'Parfait', pass: 'Réussi', early: 'Trop tôt', late: 'Trop tard', false_start: 'Faux départ', slow: 'Trop lent',
    d_perfect: 'Pile dessus. 0.00 s d’écart.', d_pass: (a, late) => `${a} s ${late ? 'en retard' : 'en avance'}`, d_miss: (a, late) => `${a} s ${late ? 'après' : 'avant'} la marge`,
    d_rperf: a => `Fulgurant. ${a} s sous le parfait.`, d_rpass: a => `À ${a} s du parfait.`, d_rslow: a => `${a} s au-dessus de la limite.`, d_false: 'Tu as touché avant l’extinction des feux.',
    win: 'Marge ±0.10', rwin: 'Parfait jusqu’à 0.30, réussi sous 0.40',
    beat: t => `Bats ${t} s dans Pulse`, train: 'Entraîne-toi dans Pulse', again: 'Réessayer',
    beatx: a => `Fais mieux que ${a} s d’écart dans Pulse`, keep: 'Reste parfait dans Pulse',
    more: 'Plus de cibles, une horloge cachée et un défi chaque jour dans l’appli.', more_false: 'Attends que tous les feux s’éteignent.',
    modes_h: 'Entraîne ton sens du temps', modes_p: 'Des parties courtes, une vraie précision.',
    m: [['Exact Time', 'Arrête-toi sur la cible, horloge visible'], ['Hidden Clock', 'Pareil, mais l’horloge disparaît'], ['Intervalle', 'Devine le temps entre deux signaux'], ['Réaction', 'Tape dès que les feux s’éteignent'], ['Batak', 'Tape les cibles allumées, vite']],
    shots_h: 'Dans l’appli', band_h: 'Ton record t’attend', band_p: 'Continue là où le test du navigateur s’arrête.',
    nojs: 'Le test a besoin de JavaScript. Le jeu complet est dans Pulse.', back: 'Gurrulabs', contact: 'Contact',
    pub: 'Publié', upd: 'Mis à jour', src_h: 'Sources', keep_h: 'Continue à tester', bc: 'Fil d’Ariane',
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'], date: (d, m, y) => `${d} ${m} ${y}`,
    home_title: 'Gurrulabs : studio indépendant d’applis Android',
    home_desc: 'Gurrulabs, studio d’une seule personne, crée des jeux et outils Android : Pulse, Raffy, Cyberpunk Detective et Lull. Essaie Pulse dans ton navigateur.',
    pulse_title: 'Appli Pulse : jeu de réflexes pour Android | Gurrulabs',
    pulse_desc: 'Pulse est un jeu de réflexes et de sens du temps pour Android : 5 modes, sans compte, fonctionne hors ligne. Essaie deux de ses modes dans ton navigateur.',
    guides_h: 'Tests et guides', guides_p: 'Joue dans ton navigateur ou découvre ce que disent les études.', read_h: 'Continue à lire', faq_h: 'Questions fréquentes', edu: 'Contenu éducatif.', edu_med: 'Contenu éducatif, pas un avis médical.',
    foot: ['Test de réaction', 'Défi 3 s', 'Réaction par âge', 'Meilleures applis de réflexes'], pulse_card: ['L’appli Pulse', 'Cinq modes pour t’entraîner'], read: n => `Lecture : ${n} min`,
  },
  pt: {
    home_h1: 'Apps pequenos que fazem <em>uma coisa</em> bem.', kick: 'Estúdio independente de apps Android',
    about_big: 'Uma pessoa. <em>Um problema pequeno por app.</em>', close_h: 'Comece com três segundos.',
    close_p: 'Tente parar o cronômetro em 3.00 s exatos, aqui mesmo no navegador.', raffy_chips: ['Mamada · 08:40', 'Sono · 1h25', 'Peso · 6,2 kg'],
    home_p: 'Gurrulabs é um estúdio de uma pessoa só que cria jogos e ferramentas para Android. Cada app tem sua própria página aqui: veja o que ele faz, teste no navegador quando der e baixe no Google Play.',
    see_apps: 'Ver os apps', apps_h: 'Nossos apps', apps_p: 'Quatro apps, quatro funções bem diferentes.', apps_word: 'Apps',
    cat: ['Jogo · Tempo de reação', 'Maternidade · Diário do bebê', 'Jogo · Mistérios de detetive', 'Sono · Zumbido'],
    pulse_page: 'Página do Pulse',
    about_h: 'Quem somos', about_p: 'Gurrulabs é uma pessoa só que projeta, desenvolve e cuida de cada app. Sem equipe grande nem recursos de enfeite: cada app nasce de um problema pequeno e fica focado nele.',
    pri: [['Pequenos de propósito', 'Uma tarefa por app, bem feita.'], ['Teste antes', 'Quando dá, você joga ou lê na web antes de instalar.'], ['Calmos por design', 'Sem bagunça: cada app sai do seu caminho.']],
    pulse_short: 'Pare o cronômetro no centésimo. Teste o tempo de reação e os reflexos.',
    pulse_cta: 'Experimente no navegador',
    raffy_p: 'Registre mamadas, sono e crescimento em segundos, com curvas da OMS.', raffy_cta: 'Visitar raffyparenting.com',
    cyber_p: 'Resolva crimes numa cidade neon e encontre o culpado.', lull_p: 'Sons para dormir e um diário para o zumbido incomodar menos.',
    soon: 'Em breve',
    p_kicker: 'Desafio de tempo de reação', p_h1: 'Pare o cronômetro em 3.00 s exatos', facts: ['Sem conta', 'Funciona offline'],
    t_exact: 'Exact Time', t_react: 'Reação', start: 'Iniciar', stop: 'Parar', stop_at: 'Pare em', of: t => `de ${t} s`,
    h_exact: 'Passa com ±0.10 s. Perfeito no centésimo.', h_react: 'Toque em qualquer lugar quando as luzes apagarem', wait: 'Espere as luzes apagarem', too_soon: 'Cedo demais', reaction: 'reação',
    perfect: 'Perfeito', pass: 'Passou', early: 'Cedo demais', late: 'Tarde demais', false_start: 'Largada falsa', slow: 'Lento demais',
    d_perfect: 'Na mosca. 0.00 s de diferença.', d_pass: (a, late) => `${a} s ${late ? 'atrasado' : 'adiantado'}`, d_miss: (a, late) => `${a} s ${late ? 'depois' : 'antes'} da margem`,
    d_rperf: a => `Um raio. ${a} s dentro do perfeito.`, d_rpass: a => `A ${a} s do perfeito.`, d_rslow: a => `${a} s acima do limite.`, d_false: 'Você tocou antes de as luzes apagarem.',
    win: 'Margem ±0.10', rwin: 'Perfeito até 0.30, passa abaixo de 0.40',
    beat: t => `Supere ${t} s no Pulse`, train: 'Treine no Pulse', again: 'Tentar de novo',
    beatx: a => `Supere ${a} s de diferença no Pulse`, keep: 'Continue perfeito no Pulse',
    more: 'Mais alvos, um relógio escondido e um desafio diário no app.', more_false: 'Espere todas as luzes apagarem.',
    modes_h: 'Treine seu senso de tempo', modes_p: 'Partidas curtas, precisão de verdade.',
    m: [['Exact Time', 'Pare no alvo, com o relógio à vista'], ['Hidden Clock', 'Igual, mas o relógio some'], ['Intervalo', 'Estime o tempo entre dois sinais'], ['Reação', 'Toque assim que as luzes se apagarem'], ['Batak', 'Toque nos alvos acesos, rápido']],
    shots_h: 'Dentro do app', band_h: 'Seu recorde está esperando', band_p: 'Continue de onde o teste do navegador para.',
    nojs: 'O teste precisa de JavaScript. O jogo completo está no Pulse.', back: 'Gurrulabs', contact: 'Contato',
    pub: 'Publicado', upd: 'Atualizado', src_h: 'Fontes', keep_h: 'Continue testando', bc: 'Trilha de navegação',
    months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'], date: (d, m, y) => `${d} de ${m} de ${y}`,
    home_title: 'Gurrulabs: estúdio independente de apps Android',
    home_desc: 'Gurrulabs é um estúdio de uma pessoa só que cria jogos e ferramentas para Android: Pulse, Raffy, Cyberpunk Detective e Lull. Teste o Pulse no navegador.',
    pulse_title: 'App Pulse: jogo de reflexos para Android | Gurrulabs',
    pulse_desc: 'Pulse é um jogo de reflexos e noção de tempo para Android: 5 modos, sem conta e funciona offline. Experimente dois dos modos no navegador.',
    guides_h: 'Testes e guias', guides_p: 'Jogue no navegador ou veja o que dizem os estudos.', read_h: 'Continue lendo', faq_h: 'Perguntas frequentes', edu: 'Conteúdo educativo.', edu_med: 'Conteúdo educativo, não é conselho médico.',
    foot: ['Teste de reação', 'Desafio 3 s', 'Reação por idade', 'Melhores apps de reflexo'], pulse_card: ['O app Pulse', 'Cinco modos para treinar'], read: n => `Leitura de ${n} min`,
  },
};

// Strings the browser test needs. Functions become templates: one-arg -> "{a}", d_pass/d_miss -> [early, late].
function i18n(t) {
  const a = '{a}';
  const out = {};
  for (const k of ['t_exact', 't_react', 'start', 'stop', 'stop_at', 'h_exact', 'h_react', 'wait', 'too_soon', 'reaction', 'perfect', 'pass', 'early', 'late', 'false_start', 'slow',
    'd_perfect', 'd_false', 'win', 'rwin', 'train', 'again', 'keep', 'more', 'more_false']) out[k] = t[k];
  for (const k of ['of', 'd_rperf', 'd_rpass', 'd_rslow', 'beat', 'beatx']) out[k] = t[k](a);
  for (const k of ['d_pass', 'd_miss']) out[k] = [t[k](a, false), t[k](a, true)];
  return JSON.stringify(out).replace(/</g, '\\u003c');
}

// ── Content pages (Pulse test, age guide, 3 s challenge). Figures come ONLY from the T-007 sources check
//    (.lead/attachments/T-007/sources.md, SUPPORTED wording) and each one sits next to its citation R(key).
//    Per page id and locale: { title, desc, name (breadcrumb / card), h1, card (card one-liner), kick, upd (optional: replaces the "Updated" label), note (optional: appended to the Sources note), sub, facts (test/challenge),
//    answer (guide), body, push [b, s, link label (guide → test)], after (guide), faq [[q, a]], band [h, p] }.
//    `sources` (shared by the locales) feeds the Sources list, the Article citation and the #src-<key> anchors.
const byId = Object.fromEntries(PAGES.map(p => [p.id, p]));
const to = (loc, id) => path(loc, byId[id]);
const PULSE_CONTENT = PAGES.filter(p => p.app === 'pulse' && p.slug); // Pulse's content pages in registry order (link cards, footer)
const SRC = {
  woods: { cite: 'Woods et al., 2015', url: 'https://doi.org/10.3389/fnhum.2015.00131',
    ref: 'Woods DL, Wyma JM, Yund EW, Herron TJ, Reed B. Factors influencing the latency of simple reaction time. <i>Frontiers in Human Neuroscience</i>, 2015; 9:131.' },
  jain: { cite: 'Jain et al., 2015', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/',
    ref: 'Jain A, Bansal R, Kumar A, Singh KD. A comparative study of visual and auditory reaction times on the basis of gender and physical activity levels of medical first year students. <i>International Journal of Applied and Basic Medical Research</i>, 2015; 5(2):124–127.' },
  lim: { cite: 'Lim &amp; Dinges, 2008', url: 'https://doi.org/10.1196/annals.1417.002',
    ref: 'Lim J, Dinges DF. Sleep deprivation and vigilant attention. <i>Annals of the New York Academy of Sciences</i>, 2008; 1129:305–322.' },
  wa: { cite: 'World Athletics, 2026', url: 'https://worldathletics.org/about-iaaf/documents/book-of-rules',
    ref: 'World Athletics. <i>Competition and Technical Rules</i>, 2026 Edition, Technical Rule 16.6 (false start).' },
  dye: { cite: 'Dye et al., 2009', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2871325/',
    ref: 'Dye MWG, Green CS, Bavelier D. Increasing speed of processing with action video games. <i>Current Directions in Psychological Science</i>, 2009; 18(6):321–326.' },
  derdeary: { cite: 'Der &amp; Deary, 2006', url: 'https://doi.org/10.1037/0882-7974.21.1.62',
    ref: 'Der G, Deary IJ. Age and sex differences in reaction time in adulthood: results from the United Kingdom Health and Lifestyle Survey. <i>Psychology and Aging</i>, 2006; 21(1):62–73.' },
  gibbon: { cite: 'Gibbon, 1977', url: 'https://doi.org/10.1037/0033-295X.84.3.279',
    ref: 'Gibbon J. Scalar expectancy theory and Weber’s law in animal timing. <i>Psychological Review</i>, 1977; 84(3):279–325.' },
  haigh: { cite: 'Haigh et al., 2021', url: 'https://doi.org/10.3758/s13414-020-02128-6',
    ref: 'Haigh A, Apthorp D, Bizo LA. The role of Weber’s law in human time perception. <i>Attention, Perception, &amp; Psychophysics</i>, 2021; 83(1):435–447.' },
  poppel: { cite: 'Pöppel, 1997', url: 'https://doi.org/10.1016/S1364-6613(97)01008-5',
    ref: 'Pöppel E. A hierarchical model of temporal perception. <i>Trends in Cognitive Sciences</i>, 1997; 1(2):56–61.' },
  gp_pulse: { cite: 'Google Play: Pulse', url: 'https://play.google.com/store/apps/details?id=com.gurrulabs.pulse&hl=en_US&gl=US',
    ref: 'Google Play listing: Pulse (Gurrulabs), checked 6 Nov 2026.' },
  gp_nix: { cite: 'Google Play: Reaction training', url: 'https://play.google.com/store/apps/details?id=com.nixgames.reaction&hl=en_US&gl=US',
    ref: 'Google Play listing: Reaction training (nixGames), checked 6 Nov 2026.' },
  gp_banen: { cite: 'Google Play: Reaction Time', url: 'https://play.google.com/store/apps/details?id=darksacor.reactiontime&hl=en_US&gl=US',
    ref: 'Google Play listing: Reaction Time (Banensoft), checked 6 Nov 2026.' },
  gp_lumo: { cite: 'Google Play: Lumosity', url: 'https://play.google.com/store/apps/details?id=com.lumoslabs.lumosity&hl=en_US&gl=US',
    ref: 'Google Play listing: Lumosity (Lumos Labs), checked 6 Nov 2026.' },
  gp_peak: { cite: 'Google Play: Peak', url: 'https://play.google.com/store/apps/details?id=com.brainbow.peak.app&hl=en_US&gl=US',
    ref: 'Google Play listing: Peak (Synaptic Labs), checked 6 Nov 2026.' },
};
function cite(k, extra) { return `<a class="ref" href="#src-${k}">${SRC[k].cite}${extra ? ', ' + extra : ''}</a>`; }
function R(k, extra) { return `(${cite(k, extra)})`; }
function dec(loc, v) { return loc === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ','); }
// Woods et al. 2015, Table 2, Experiment 1: [age group as printed in the paper ("51-58" included), mean SRT ms as measured, between-person SD ms]
const WOODS = [['18–24', 217.9, 19.5], ['25–31', 221.0, 22.8], ['32–38', 224.8, 23.4], ['39–45', 227.7, 26.6], ['46–51', 233.6, 27.2], ['51–58', 236.4, 27.0], ['59–65', 239.1, 28.1]];
const WOODS_ALL = [230.8, 26.8];
// L = [age, mean, SD, source, "all" row label, caption, "Table 2" label]. Bars are proportional from zero (no truncated axis).
function ageTable(loc, [hAge, hMean, hSd, hSrc, all, cap, t2]) {
  const row = (age, m, sd) => `<tr><td>${age}</td><td><span class="bar" style="width:${Math.round(m / 3)}px"></span>${dec(loc, m)} ms</td><td>${dec(loc, sd)} ms</td><td>${cite('woods', t2)}</td></tr>`;
  return `<div class="tbl"><table>
      <thead><tr><th>${hAge}</th><th>${hMean}</th><th>${hSd}</th><th>${hSrc}</th></tr></thead>
      <tbody>${WOODS.map(r => row(...r)).join('')}${row(all, ...WOODS_ALL)}</tbody>
      <caption>${cap}</caption>
    </table></div>`;
}
// Challenge rules = the browser game's verdicts (script.js exactVerdict): perfect 3.00, pass within ±0.10 s, otherwise miss
function rulesBlock(r) {
  return `<div class="rules"><div><b class="v-perfect tnum">3.00</b><span>${r[0]}</span></div><div><b class="v-pass tnum">2.90–3.10</b><span>${r[1]}</span></div><div><b class="v-miss tnum">&lt; 2.90 · &gt; 3.10</b><span>${r[2]}</span></div></div>`;
}

// Comparison page: facts from each app's Google Play listing (US, English), checked 2026-11-06. L = localized labels and cell texts.
// Cells "not stated" / "No" get class n, the offline "Yes" of Peak gets y.
function cmpTable(L) {
  const td = (v, cls) => `<td${cls ? ` class="${cls}"` : ''}>${v}</td>`;
  const row = (us, name, dev, price, ads, modes, off) => `<tr${us ? ' class="us"' : ''}><td><b>${name}</b><small>${dev}</small></td>${td(price)}${ads === L.no ? td(ads, 'n') : td(ads)}${td(modes)}${td(L.ns, 'n')}${off ? td(off, 'y') : td(L.ns, 'n')}</tr>`;
  return `<div class="tbl cmp"><table>
      <thead><tr>${L.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${[row(1, 'Pulse', L.us, L.free, L.yes, L.modes[0]), row(0, 'Reaction training', 'nixGames', L.iap, L.yes, L.modes[1]),
        row(0, 'Reaction Time', 'Banensoft', L.iap, L.yes, L.modes[2]), row(0, 'Lumosity', 'Lumos Labs', L.sub, L.no, L.modes[3]),
        row(0, 'Peak', 'Synaptic Labs', L.iap, L.yes, L.modes[4], L.offl)].join('\n        ')}</tbody>
      <caption>${L.cap}</caption>
    </table></div>`;
}
const critList = c => `<ul class="crit">${c.map(([b, r]) => `<li><strong>${b}</strong>${r}</li>`).join('')}</ul>`;
const picks = p => `<div class="picks">${p.map(([e, b, t]) => `<div><em>${e}</em><b>${b}</b><p>${t}</p></div>`).join('')}</div>`;

const CONTENT = {
  'reaction-test': { sources: [SRC.woods, SRC.jain, SRC.lim, SRC.wa, SRC.dye],
    en: { title: 'Reaction time test online: how fast are you? | Gurrulabs',
      desc: 'Measure your reaction time in your browser: tap when the lights go out. See what counts as a good time in studies, then train in Pulse for Android.',
      name: 'Reaction time test', h1: 'Reaction time test', card: 'Three lights: test your reflexes',
      kick: 'Online test · no sign-up', sub: 'Three lights come on one by one. When they go out, tap. Your time is shown in seconds, to the hundredth.',
      facts: ['No account', 'Mouse, finger or space bar'],
      body: `<h2>What is a good reaction time?</h2>
    <div class="answer">In a simple visual test like this one, adults aged 18 to 24 averaged <b>0.218 s</b> in a large lab study ${R('woods')}. In a second experiment of the same study, with adults aged 18 to 82, the average was <b>0.238 s</b> ${R('woods')}, and another study measured <b>0.248 s</b> in students aged 18 to 20, taking each person’s best of five tries ${R('jain')}.</div>
    <p>Each study uses its own equipment, so treat these as a guide, not a grade. In Pulse, times up to 0.30 s count as <strong>perfect</strong> and times under 0.40 s as a <strong>pass</strong>; those are the game’s rules, not a medical norm. Tapping before the lights go out is a <strong>false start</strong>.</p>
    <h2>How the test works</h2>
    <p>It is a simple reaction test: one signal (the lights go out) and one response (your tap).</p>
    <ol><li>Press <strong>Start</strong>. The three lights come on one by one at an irregular pace, so you cannot guess the timing.</li><li>When they are all out, tap anywhere on the panel or press the space bar.</li><li>The time runs from lights out to your tap. Try several times and look at your average, not a single try.</li></ol>
    <h2>Why your result can vary</h2>
    <p>Because reaction time depends on you and on your device. Factors that can change it include age, sex, practice and fatigue ${R('jain')}.</p>
    <p>Age matters little: about 0.5 ms more per year between 18 and 65 ${R('woods')}. Sleep matters too: sleep loss slows responses and makes lapses longer than half a second more frequent ${R('lim')}. Even within one long session, responses get a little slower: from 228.1 ms in the first block of 20 trials to 237.2 ms in the last ${R('woods')}.</p>
    <p>Your device adds time as well: screen, mouse and software delays can add up to 100 ms to the measured time ${R('woods')}. Always compare your scores on the same device.</p>
    <p>Want to see how it changes over the years? Read <a href="${to('en', 'age-guide')}">average reaction time by age</a>.</p>
    <h2>What about in sport?</h2>
    <p>In athletics, a reaction off the blocks faster than <strong>0.100 s</strong> is flagged as a possible false start.</p>
    <p>When a certified start information system is used, it alerts the starter with an acoustic signal to a possible false start whenever an athlete’s reaction time is under 0.100 s, and the starter then checks the start ${R('wa', 'Technical Rule 16.6')}.</p>`,
      push: ['Train your reflexes in Pulse', 'Reaction, Batak and three timing games, offline.'],
      faq: [['Can you improve your reaction time?', `Partly. On fast choice tasks, action video game players responded 11% faster than non-players with the same accuracy, and some training studies indicate that playing can speed up responses ${R('dye')}. Sleep loss, on the other hand, slows you down ${R('lim')}.`],
        ['Is a phone or a computer better?', 'Either works. What matters is comparing your scores on the same device, because every screen and mouse adds its own delay.'],
        ['Do you save my results?', 'No account needed, and the test keeps no history of your times: reload the page and you start from scratch.']],
      band: ['Your best is waiting', 'Reaction, Batak and a daily challenge in the app.'] },
    es: { title: 'Test de tiempo de reacción: mide tus reflejos | Gurrulabs',
      desc: 'Mide tu tiempo de reacción en el navegador con luces de salida. Mira qué es un buen tiempo según los estudios y entrena después en Pulse para Android.',
      name: 'Test de tiempo de reacción', h1: 'Test de tiempo de reacción', card: 'Tres luces: mide tus reflejos',
      kick: 'Test online · sin registro', sub: 'Tres luces se encienden una a una. Cuando se apagan, toca. Tu tiempo sale en segundos, con centésimas.',
      facts: ['Sin cuenta', 'Ratón, dedo o barra espaciadora'],
      body: `<h2>¿Qué es un buen tiempo de reacción?</h2>
    <div class="answer">En una prueba visual simple como esta, los adultos de 18 a 24 años tardaron de media <b>0,218 s</b> en un gran estudio de laboratorio ${R('woods')}. En un segundo experimento del mismo estudio, con adultos de 18 a 82 años, la media fue de <b>0,238 s</b> ${R('woods')}, y otro estudio midió <b>0,248 s</b> en estudiantes de 18 a 20 años, quedándose con el mejor de cinco intentos de cada persona ${R('jain')}.</div>
    <p>Cada estudio usa su propio equipo, así que tómalo como orientación, no como una nota. En Pulse cuentan como <strong>perfecto</strong> los tiempos hasta 0,30 s y como <strong>superado</strong> los que bajan de 0,40 s; son las reglas del juego, no una norma médica. Si tocas antes de que se apaguen las luces es <strong>salida falsa</strong>.</p>
    <h2>Cómo funciona el test</h2>
    <p>Es una prueba de reacción simple: una señal (las luces se apagan) y una respuesta (tu toque).</p>
    <ol><li>Pulsa <strong>Iniciar</strong>. Las tres luces se encienden una a una con un ritmo irregular, para que no puedas adivinarlo.</li><li>Cuando se apagan todas, toca en cualquier parte del panel o pulsa la barra espaciadora.</li><li>El tiempo va desde el apagado hasta tu toque. Repite varias veces y fíjate en la media, no en un intento suelto.</li></ol>
    <h2>Por qué tu resultado puede variar</h2>
    <p>Porque el tiempo de reacción depende de ti y también del aparato. Entre los factores que pueden cambiarlo están la edad, el sexo, la práctica y el cansancio ${R('jain')}.</p>
    <p>La edad pesa poco: unos 0,5 ms más por año entre los 18 y los 65 ${R('woods')}. El sueño también cuenta: dormir poco ralentiza las respuestas y hace más frecuentes los lapsos de más de medio segundo ${R('lim')}. Incluso dentro de una misma sesión larga, las respuestas se vuelven algo más lentas: de 228,1 ms en el primer bloque de 20 intentos a 237,2 ms en el último ${R('woods')}.</p>
    <p>El aparato también suma: la pantalla, el ratón y el software pueden añadir hasta 100 ms al tiempo medido ${R('woods')}. Compara tus marcas siempre en el mismo dispositivo.</p>
    <p>¿Quieres ver cómo cambia con los años? Lo explicamos en <a href="${to('es', 'age-guide')}">tiempo de reacción medio por edad</a>.</p>
    <h2>¿Y en el deporte?</h2>
    <p>En atletismo, una reacción en los tacos de menos de <strong>0,100 s</strong> se marca como posible salida falsa.</p>
    <p>Cuando se usa un sistema de información de salida certificado, este avisa al juez de salida con una señal acústica de una posible salida falsa si el tiempo de reacción de un atleta es inferior a 0,100 s, y el juez revisa entonces la salida ${R('wa', 'Regla Técnica 16.6')}.</p>`,
      push: ['Entrena tus reflejos en Pulse', 'Reacción, Batak y tres juegos de tiempo, sin conexión.'],
      faq: [['¿Se puede mejorar el tiempo de reacción?', `En parte. En tareas de elección rápida, los jugadores de videojuegos de acción respondieron un 11 % más rápido que quienes no juegan, con la misma precisión, y algunos estudios de entrenamiento indican que jugar puede acelerar las respuestas ${R('dye')}. Dormir poco, en cambio, te hace más lento ${R('lim')}.`],
        ['¿Es mejor usar el móvil o el ordenador?', 'Cualquiera sirve. Lo importante es comparar tus marcas en el mismo aparato, porque cada pantalla y cada ratón añaden su propio retraso.'],
        ['¿Guardáis mis resultados?', 'No hace falta cuenta y el test no guarda un historial de tus tiempos: si recargas la página, empiezas de cero.']],
      band: ['Tu mejor marca te espera', 'Reacción, Batak y un reto diario en la app.'] },
    fr: { title: 'Test de temps de réaction : mesure tes réflexes | Gurrulabs',
      desc: 'Mesure ton temps de réaction en ligne : touche quand les feux s’éteignent, vois ce qu’est un bon temps selon les études, puis entraîne-toi dans Pulse.',
      name: 'Test de temps de réaction', h1: 'Test de temps de réaction', card: 'Trois feux : mesure tes réflexes',
      kick: 'Test en ligne · sans inscription', sub: 'Trois feux s’allument un par un. Quand ils s’éteignent, touche. Ton temps s’affiche en secondes, au centième.',
      facts: ['Sans compte', 'Souris, doigt ou barre d’espace'],
      body: `<h2>Qu’est-ce qu’un bon temps de réaction ?</h2>
    <div class="answer">Dans un test visuel simple comme celui-ci, les adultes de 18 à 24 ans ont obtenu en moyenne <b>0,218 s</b> dans une grande étude en laboratoire ${R('woods')}. Dans une deuxième expérience de la même étude, avec des adultes de 18 à 82 ans, la moyenne était de <b>0,238 s</b> ${R('woods')}, et une autre étude a mesuré <b>0,248 s</b> chez des étudiants de 18 à 20 ans, en gardant le meilleur de cinq essais de chacun ${R('jain')}.</div>
    <p>Chaque étude utilise son propre matériel : prends ces chiffres comme un repère, pas comme une note. Dans Pulse, un temps jusqu’à 0,30 s compte comme <strong>parfait</strong> et sous 0,40 s comme <strong>réussi</strong> ; ce sont les règles du jeu, pas une norme médicale. Si tu touches avant l’extinction des feux, c’est un <strong>faux départ</strong>.</p>
    <h2>Comment fonctionne le test</h2>
    <p>C’est un test de réaction simple : un signal (les feux s’éteignent) et une réponse (ton appui).</p>
    <ol><li>Appuie sur <strong>Démarrer</strong>. Les trois feux s’allument un par un à un rythme irrégulier, pour que tu ne puisses pas deviner le moment.</li><li>Quand ils sont tous éteints, touche n’importe où sur le panneau ou appuie sur la barre d’espace.</li><li>Le temps va de l’extinction des feux à ton appui. Fais plusieurs essais et regarde ta moyenne, pas un essai isolé.</li></ol>
    <h2>Pourquoi ton résultat peut varier</h2>
    <p>Parce que le temps de réaction dépend de toi, mais aussi de ton appareil. Parmi les facteurs qui peuvent le faire varier : l’âge, le sexe, l’entraînement et la fatigue ${R('jain')}.</p>
    <p>L’âge pèse peu : environ 0,5 ms de plus par an entre 18 et 65 ans ${R('woods')}. Le sommeil compte aussi : le manque de sommeil ralentit les réponses et rend plus fréquentes les absences de plus d’une demi-seconde ${R('lim')}. Même au cours d’une longue séance, les réponses ralentissent un peu : de 228,1 ms dans le premier bloc de 20 essais à 237,2 ms dans le dernier ${R('woods')}.</p>
    <p>L’appareil ajoute aussi du temps : l’écran, la souris et le logiciel peuvent ajouter jusqu’à 100 ms au temps mesuré ${R('woods')}. Compare toujours tes scores sur le même appareil.</p>
    <p>Tu veux voir comment il évolue avec les années ? On l’explique dans <a href="${to('fr', 'age-guide')}">temps de réaction moyen par âge</a>.</p>
    <h2>Et dans le sport ?</h2>
    <p>En athlétisme, une réaction dans les starting-blocks de moins de <strong>0,100 s</strong> est signalée comme un possible faux départ.</p>
    <p>Quand un système d’information au départ certifié est utilisé, il prévient le starter par un signal sonore d’un possible faux départ dès que le temps de réaction d’un athlète est inférieur à 0,100 s ; le starter vérifie alors le départ ${R('wa', 'règle technique 16.6')}.</p>`,
      push: ['Entraîne tes réflexes dans Pulse', 'Réaction, Batak et trois jeux de timing, hors ligne.'],
      faq: [['Peut-on améliorer son temps de réaction ?', `En partie. Sur des tâches de choix rapide, les joueurs de jeux vidéo d’action ont répondu 11 % plus vite que les non-joueurs, avec la même précision, et des études d’entraînement indiquent que jouer peut accélérer les réponses ${R('dye')}. À l’inverse, le manque de sommeil te ralentit ${R('lim')}.`],
        ['Mieux vaut un téléphone ou un ordinateur ?', 'Les deux conviennent. L’important est de comparer tes scores sur le même appareil, car chaque écran et chaque souris ajoutent leur propre délai.'],
        ['Vous enregistrez mes résultats ?', 'Pas besoin de compte, et le test ne garde pas d’historique de tes temps : recharge la page et tu repars de zéro.']],
      band: ['Ton record t’attend', 'Réaction, Batak et un défi chaque jour dans l’appli.'] },
    pt: { title: 'Teste de tempo de reação: meça seus reflexos | Gurrulabs',
      desc: 'Meça seu tempo de reação no navegador: toque quando as luzes apagarem. Veja o que é um bom tempo segundo os estudos e treine depois no Pulse para Android.',
      name: 'Teste de tempo de reação', h1: 'Teste de tempo de reação', card: 'Três luzes: meça seus reflexos',
      kick: 'Teste online · sem cadastro', sub: 'Três luzes acendem uma a uma. Quando apagarem, toque. Seu tempo aparece em segundos, no centésimo.',
      facts: ['Sem conta', 'Mouse, dedo ou barra de espaço'],
      body: `<h2>O que é um bom tempo de reação?</h2>
    <div class="answer">Num teste visual simples como este, adultos de 18 a 24 anos tiveram média de <b>0,218 s</b> num grande estudo de laboratório ${R('woods')}. Num segundo experimento do mesmo estudo, com adultos de 18 a 82 anos, a média foi de <b>0,238 s</b> ${R('woods')}, e outro estudo mediu <b>0,248 s</b> em estudantes de 18 a 20 anos, usando a melhor de cinco tentativas de cada pessoa ${R('jain')}.</div>
    <p>Cada estudo usa seu próprio equipamento, então use esses números como referência, não como nota. No Pulse, tempos de até 0,30 s contam como <strong>perfeito</strong> e abaixo de 0,40 s como <strong>passou</strong>; são as regras do jogo, não uma norma médica. Se você tocar antes de as luzes apagarem, é <strong>largada falsa</strong>.</p>
    <h2>Como o teste funciona</h2>
    <p>É um teste de reação simples: um sinal (as luzes apagam) e uma resposta (seu toque).</p>
    <ol><li>Toque em <strong>Iniciar</strong>. As três luzes acendem uma a uma num ritmo irregular, para você não conseguir adivinhar.</li><li>Quando todas apagarem, toque em qualquer parte do painel ou aperte a barra de espaço.</li><li>O tempo vai do apagar das luzes até o seu toque. Repita várias vezes e olhe a média, não uma tentativa solta.</li></ol>
    <h2>Por que seu resultado pode variar</h2>
    <p>Porque o tempo de reação depende de você e também do aparelho. Entre os fatores que podem mudá-lo estão idade, sexo, prática e cansaço ${R('jain')}.</p>
    <p>A idade pesa pouco: cerca de 0,5 ms a mais por ano entre os 18 e os 65 ${R('woods')}. O sono também conta: dormir pouco deixa as respostas mais lentas e torna mais frequentes os lapsos de mais de meio segundo ${R('lim')}. Mesmo numa única sessão longa, as respostas ficam um pouco mais lentas: de 228,1 ms no primeiro bloco de 20 tentativas para 237,2 ms no último ${R('woods')}.</p>
    <p>O aparelho também soma: tela, mouse e software podem acrescentar até 100 ms ao tempo medido ${R('woods')}. Compare suas marcas sempre no mesmo dispositivo.</p>
    <p>Quer ver como ele muda com os anos? Explicamos em <a href="${to('pt', 'age-guide')}">tempo de reação médio por idade</a>.</p>
    <h2>E no esporte?</h2>
    <p>No atletismo, uma reação no bloco de largada abaixo de <strong>0,100 s</strong> é sinalizada como possível largada falsa.</p>
    <p>Quando se usa um sistema de informação de largada certificado, ele avisa o árbitro de largada com um sinal sonoro de uma possível largada falsa sempre que o tempo de reação de um atleta fica abaixo de 0,100 s; o árbitro então verifica a largada ${R('wa', 'Regra Técnica 16.6')}.</p>`,
      push: ['Treine seus reflexos no Pulse', 'Reação, Batak e três jogos de tempo, offline.'],
      faq: [['Dá para melhorar o tempo de reação?', `Em parte. Em tarefas de escolha rápida, jogadores de videogames de ação responderam 11% mais rápido que não jogadores, com a mesma precisão, e alguns estudos de treino indicam que jogar pode acelerar as respostas ${R('dye')}. Já dormir pouco deixa você mais lento ${R('lim')}.`],
        ['É melhor usar o celular ou o computador?', 'Qualquer um serve. O importante é comparar suas marcas no mesmo aparelho, porque cada tela e cada mouse têm seu próprio atraso.'],
        ['Vocês guardam meus resultados?', 'Não precisa de conta, e o teste não guarda um histórico dos seus tempos: recarregue a página e você começa do zero.']],
      band: ['Seu recorde está esperando', 'Reação, Batak e um desafio diário no app.'] } },

  'age-guide': { sources: [SRC.woods, SRC.lim, SRC.dye, SRC.derdeary],
    en: { title: 'Average reaction time by age: table and studies | Gurrulabs',
      desc: 'How fast people react at each age, from a study of 1,469 adults. Table from 18 to 65, what changes it, and a test to measure yours.',
      name: 'Average reaction time by age', h1: 'Average reaction time by age', card: 'Study averages, with sources',
      kick: 'Guide · Reaction time', sub: 'What a study of 1,469 adults measured, age group by age group, and why a few milliseconds are nothing to worry about.',
      answer: `Simple reaction time rises slowly with age: in a study of 1,469 adults, the average went from <b>217.9 ms</b> in the 18–24 group to <b>239.1 ms</b> in the 59–65 group, about 0.5 ms per year ${R('woods', 'Table 2')}. People of the same age usually differ by more than that: within each group the standard deviation was 19.5 to 28.1 ms, against about 21 ms between the youngest and the oldest group.`,
      body: `<h2>Table by age</h2>
    <p>These are the group averages from Table 2 of a 2015 lab study: simple reaction to a visual stimulus, that is, pressing as soon as a signal appears ${R('woods')}.</p>
    ${ageTable('en', ['Age', 'Average time', 'Standard deviation', 'Source', 'All (18–65)', 'Woods et al. (2015), Table 2, Experiment 1: 1,469 adults aged 18 to 65. Age groups as printed in the study; times in milliseconds as measured.', 'Table 2'])}
    <p>They are group averages, not a cut-off for “normal”. They were measured on a calibrated PC and include about 18 ms of screen and mouse delay, which the study itself measured ${R('woods')}. There is no 70+ row because the study does not publish group averages above 65.</p>
    <h2>What makes you react faster or slower</h2>
    <p>Mostly age, sleep and the device you measure on; practice makes your average reliable.</p>
    <h3>Age</h3>
    <p>Between 18 and 65, the average rises by about 0.5 ms per year ${R('woods')}. It is a slow change: from the youngest group to the oldest there are about 21 ms, roughly two hundredths of a second.</p>
    <h3>Fatigue and sleep</h3>
    <p>Sleep loss slows responses and makes lapses, responses that take longer than half a second, more frequent ${R('lim')}.</p>
    <h3>Practice</h3>
    <p>One try says little. Do several and keep the average; if you do many, rest between rounds, because even within one long session responses get a little slower ${R('woods')}.</p>
    <h3>Your device</h3>
    <p>Screens, mice and software can add up to 100 ms to the measured time ${R('woods')}. That is why an online test cannot be compared with the table to the millisecond: always compare on the same device.</p>`,
      push: ['Measure yours now', 'Reaction test in your browser, no account.', 'Take the test'],
      after: `<h2>Is my time normal?</h2>
    <p>This guide is <strong>educational</strong>: an online test cannot diagnose anything.</p>
    <p>The averages in the table were measured in a lab on calibrated equipment; your browser and screen add their own delay, so compare yourself mainly with yourself. If you notice your reflexes have changed suddenly, talk to a health professional.</p>`,
      faq: [['At what age is reaction time fastest?', `In the youngest group of the study, aged 18 to 24: 217.9 ms on average. From there the average rose in every age group up to 65 ${R('woods', 'Table 2')}.`],
        ['Do video games improve reflexes?', `On fast choice tasks, action video game players responded 11% faster than non-players, with the same accuracy. Some training studies indicate that playing can speed up responses ${R('dye')}.`],
        ['What is the difference between simple and choice reaction time?', `Simple reaction has one signal and one response, like our test. Choice reaction has several signals, each with its own response. In a study of 7,130 adults, simple reaction time showed little slowing until around 50, whereas choice reaction time slowed throughout adulthood ${R('derdeary')}.`]],
      band: ['Train your reflexes every day', 'Pulse for Android: no account, works offline.'] },
    es: { title: 'Tiempo de reacción medio por edad: tabla | Gurrulabs',
      desc: 'Cuánto tarda en reaccionar una persona a cada edad, según un estudio con 1.469 adultos. Tabla de 18 a 65 años, qué lo cambia y un test para medir el tuyo.',
      name: 'Tiempo de reacción por edad', h1: 'Tiempo de reacción medio por edad', card: 'Medias de los estudios, con fuentes',
      kick: 'Guía · Tiempo de reacción', sub: 'Qué midió un estudio con 1.469 adultos, grupo de edad a grupo de edad, y por qué unas milésimas no deberían preocuparte.',
      answer: `El tiempo de reacción simple sube despacio con la edad: en un estudio con 1.469 adultos, la media pasó de <b>217,9 ms</b> en el grupo de 18–24 años a <b>239,1 ms</b> en el de 59–65, unos 0,5 ms por año ${R('woods', 'tabla 2')}. La diferencia entre personas de la misma edad suele ser mayor: dentro de cada grupo, la desviación típica fue de 19,5 a 28,1 ms, frente a unos 21 ms entre el grupo más joven y el mayor.`,
      body: `<h2>Tabla por edad</h2>
    <p>Estas son las medias por grupo de edad de la tabla 2 de un estudio de laboratorio de 2015: reacción simple a un estímulo visual, es decir, pulsar en cuanto aparece una señal ${R('woods')}.</p>
    ${ageTable('es', ['Edad', 'Tiempo medio', 'Desviación típica', 'Fuente', 'Todos (18–65)', 'Woods et al. (2015), tabla 2, experimento 1: 1.469 adultos de 18 a 65 años. Grupos de edad tal como los publica el estudio; tiempos en milisegundos tal como se midieron.', 'tabla 2'])}
    <p>Son medias de grupo, no un umbral de «normal». Se midieron en un PC calibrado e incluyen unos 18 ms de retraso de la pantalla y el ratón, que el propio estudio midió ${R('woods')}. No hay fila de 70 años o más porque el estudio no publica medias por grupo por encima de los 65.</p>
    <h2>Qué hace que reacciones más rápido o más lento</h2>
    <p>Sobre todo la edad, el sueño y el aparato con el que mides; la práctica hace que tu media sea fiable.</p>
    <h3>Edad</h3>
    <p>Entre los 18 y los 65 años, el tiempo medio sube unos 0,5 ms por año ${R('woods')}. Es un cambio lento: del grupo más joven al mayor hay unos 21 ms, unas dos centésimas de segundo.</p>
    <h3>Cansancio y sueño</h3>
    <p>Dormir poco ralentiza las respuestas y hace más frecuentes los lapsos, respuestas que tardan más de medio segundo ${R('lim')}.</p>
    <h3>Práctica</h3>
    <p>Un intento suelto dice poco. Haz varios y quédate con la media; si haces muchos, descansa entre series, porque incluso dentro de una sesión larga las respuestas se vuelven algo más lentas ${R('woods')}.</p>
    <h3>El aparato</h3>
    <p>Pantallas, ratones y software pueden sumar hasta 100 ms al tiempo medido ${R('woods')}. Por eso un test online no se puede comparar al milisegundo con la tabla: compara siempre en el mismo dispositivo.</p>`,
      push: ['Mide el tuyo ahora', 'Test de reacción en el navegador, sin cuenta.', 'Hacer el test'],
      after: `<h2>¿Mi tiempo es normal?</h2>
    <p>Esta guía es <strong>educativa</strong>: un test online no sirve para diagnosticar nada.</p>
    <p>Las medias de la tabla se midieron en laboratorio con un equipo calibrado; tu navegador y tu pantalla añaden su propio retraso, así que compárate sobre todo contigo mismo. Si notas que tus reflejos han cambiado de golpe, coméntalo con un profesional sanitario.</p>`,
      faq: [['¿A qué edad es más rápido el tiempo de reacción?', `En el grupo más joven del estudio, de 18 a 24 años: 217,9 ms de media. A partir de ahí, la media subió en cada grupo de edad hasta los 65 ${R('woods', 'tabla 2')}.`],
        ['¿Los videojuegos mejoran los reflejos?', `En tareas de elección rápida, los jugadores de videojuegos de acción respondieron un 11 % más rápido que quienes no juegan, con la misma precisión. Algunos estudios de entrenamiento indican que jugar puede acelerar las respuestas ${R('dye')}.`],
        ['¿Qué diferencia hay entre reacción simple y de elección?', `En la simple hay una señal y una respuesta, como en nuestro test. En la de elección hay varias señales y una respuesta distinta para cada una. En un estudio con 7.130 adultos, la reacción simple apenas se ralentizó hasta cerca de los 50 años, mientras que la de elección se ralentizó durante toda la vida adulta ${R('derdeary')}.`]],
      band: ['Entrena tus reflejos cada día', 'Pulse para Android: sin cuenta, funciona sin conexión.'] },
    fr: { title: 'Temps de réaction moyen par âge : tableau | Gurrulabs',
      desc: 'Le temps de réaction selon l’âge, d’après une étude sur 1 469 adultes : tableau de 18 à 65 ans, ce qui le fait varier et un test pour mesurer le tien.',
      name: 'Temps de réaction par âge', h1: 'Temps de réaction moyen par âge', card: 'Moyennes des études, avec sources',
      kick: 'Guide · Temps de réaction', sub: 'Ce qu’une étude sur 1 469 adultes a mesuré, tranche d’âge par tranche d’âge, et pourquoi quelques millisecondes ne doivent pas t’inquiéter.',
      answer: `Le temps de réaction simple augmente lentement avec l’âge : dans une étude sur 1 469 adultes, la moyenne est passée de <b>217,9 ms</b> chez les 18–24 ans à <b>239,1 ms</b> chez les 59–65 ans, soit environ 0,5 ms par an ${R('woods', 'tableau 2')}. Les écarts entre personnes du même âge sont souvent plus grands : dans chaque groupe, l’écart-type allait de 19,5 à 28,1 ms, contre environ 21 ms entre le groupe le plus jeune et le plus âgé.`,
      body: `<h2>Tableau par âge</h2>
    <p>Voici les moyennes par tranche d’âge du tableau 2 d’une étude en laboratoire de 2015 : réaction simple à un stimulus visuel, c’est-à-dire appuyer dès qu’un signal apparaît ${R('woods')}.</p>
    ${ageTable('fr', ['Âge', 'Temps moyen', 'Écart-type', 'Source', 'Tous (18–65)', 'Woods et al. (2015), tableau 2, expérience 1 : 1 469 adultes de 18 à 65 ans. Tranches d’âge telles que publiées dans l’étude ; temps en millisecondes tels que mesurés.', 'tableau 2'])}
    <p>Ce sont des moyennes de groupe, pas un seuil de « normal ». Elles ont été mesurées sur un PC calibré et incluent environ 18 ms de délai de l’écran et de la souris, que l’étude a elle-même mesuré ${R('woods')}. Il n’y a pas de ligne 70 ans et plus, car l’étude ne publie pas de moyennes par groupe au-delà de 65 ans.</p>
    <h2>Ce qui te fait réagir plus vite ou plus lentement</h2>
    <p>Surtout l’âge, le sommeil et l’appareil sur lequel tu mesures ; l’entraînement rend ta moyenne fiable.</p>
    <h3>Âge</h3>
    <p>Entre 18 et 65 ans, la moyenne augmente d’environ 0,5 ms par an ${R('woods')}. C’est un changement lent : du groupe le plus jeune au plus âgé, il y a environ 21 ms, à peu près deux centièmes de seconde.</p>
    <h3>Fatigue et sommeil</h3>
    <p>Le manque de sommeil ralentit les réponses et rend plus fréquentes les absences, ces réponses qui prennent plus d’une demi-seconde ${R('lim')}.</p>
    <h3>Entraînement</h3>
    <p>Un seul essai ne dit pas grand-chose. Fais-en plusieurs et garde la moyenne ; si tu en fais beaucoup, fais des pauses, car même au cours d’une longue séance les réponses ralentissent un peu ${R('woods')}.</p>
    <h3>L’appareil</h3>
    <p>Les écrans, souris et logiciels peuvent ajouter jusqu’à 100 ms au temps mesuré ${R('woods')}. C’est pourquoi un test en ligne ne se compare pas au tableau à la milliseconde près : compare toujours sur le même appareil.</p>`,
      push: ['Mesure le tien maintenant', 'Test de réaction dans ton navigateur, sans compte.', 'Faire le test'],
      after: `<h2>Mon temps est-il normal ?</h2>
    <p>Ce guide est <strong>éducatif</strong> : un test en ligne ne permet aucun diagnostic.</p>
    <p>Les moyennes du tableau ont été mesurées en laboratoire avec du matériel calibré ; ton navigateur et ton écran ajoutent leur propre délai, alors compare-toi surtout à toi-même. Si tu remarques que tes réflexes ont changé d’un coup, parles-en à un professionnel de santé.</p>`,
      faq: [['À quel âge le temps de réaction est-il le plus rapide ?', `Dans le groupe le plus jeune de l’étude, de 18 à 24 ans : 217,9 ms en moyenne. Ensuite, la moyenne a augmenté à chaque tranche d’âge jusqu’à 65 ans ${R('woods', 'tableau 2')}.`],
        ['Les jeux vidéo améliorent-ils les réflexes ?', `Sur des tâches de choix rapide, les joueurs de jeux vidéo d’action ont répondu 11 % plus vite que les non-joueurs, avec la même précision. Des études d’entraînement indiquent que jouer peut accélérer les réponses ${R('dye')}.`],
        ['Quelle différence entre réaction simple et réaction de choix ?', `La réaction simple, c’est un signal et une réponse, comme dans notre test. La réaction de choix, ce sont plusieurs signaux, chacun avec sa propre réponse. Dans une étude sur 7 130 adultes, la réaction simple ralentissait peu jusque vers 50 ans, alors que la réaction de choix ralentissait tout au long de la vie adulte ${R('derdeary')}.`]],
      band: ['Entraîne tes réflexes chaque jour', 'Pulse pour Android : sans compte, fonctionne hors ligne.'] },
    pt: { title: 'Tempo de reação médio por idade: tabela | Gurrulabs',
      desc: 'Quanto uma pessoa demora para reagir em cada idade, segundo um estudo com 1.469 adultos. Tabela dos 18 aos 65, o que muda e um teste para medir o seu.',
      name: 'Tempo de reação por idade', h1: 'Tempo de reação médio por idade', card: 'Médias dos estudos, com fontes',
      kick: 'Guia · Tempo de reação', sub: 'O que um estudo com 1.469 adultos mediu, faixa etária por faixa etária, e por que alguns milissegundos não devem preocupar você.',
      answer: `O tempo de reação simples sobe devagar com a idade: num estudo com 1.469 adultos, a média passou de <b>217,9 ms</b> no grupo de 18–24 anos para <b>239,1 ms</b> no de 59–65, cerca de 0,5 ms por ano ${R('woods', 'tabela 2')}. A diferença entre pessoas da mesma idade costuma ser maior: dentro de cada grupo, o desvio padrão foi de 19,5 a 28,1 ms, contra cerca de 21 ms entre o grupo mais jovem e o mais velho.`,
      body: `<h2>Tabela por idade</h2>
    <p>Estas são as médias por faixa etária da tabela 2 de um estudo de laboratório de 2015: reação simples a um estímulo visual, ou seja, apertar assim que aparece um sinal ${R('woods')}.</p>
    ${ageTable('pt', ['Idade', 'Tempo médio', 'Desvio padrão', 'Fonte', 'Todos (18–65)', 'Woods et al. (2015), tabela 2, experimento 1: 1.469 adultos de 18 a 65 anos. Faixas etárias como publicadas no estudo; tempos em milissegundos como medidos.', 'tabela 2'])}
    <p>São médias de grupo, não um limite de “normal”. Foram medidas num PC calibrado e incluem cerca de 18 ms de atraso da tela e do mouse, que o próprio estudo mediu ${R('woods')}. Não há linha de 70 anos ou mais porque o estudo não publica médias por grupo acima dos 65.</p>
    <h2>O que faz você reagir mais rápido ou mais devagar</h2>
    <p>Principalmente a idade, o sono e o aparelho em que você mede; a prática deixa sua média confiável.</p>
    <h3>Idade</h3>
    <p>Entre os 18 e os 65 anos, a média sobe cerca de 0,5 ms por ano ${R('woods')}. É uma mudança lenta: do grupo mais jovem ao mais velho são cerca de 21 ms, uns dois centésimos de segundo.</p>
    <h3>Cansaço e sono</h3>
    <p>Dormir pouco deixa as respostas mais lentas e torna mais frequentes os lapsos, respostas que levam mais de meio segundo ${R('lim')}.</p>
    <h3>Prática</h3>
    <p>Uma tentativa solta diz pouco. Faça várias e fique com a média; se fizer muitas, descanse entre as séries, porque mesmo numa única sessão longa as respostas ficam um pouco mais lentas ${R('woods')}.</p>
    <h3>O aparelho</h3>
    <p>Telas, mouses e software podem acrescentar até 100 ms ao tempo medido ${R('woods')}. Por isso um teste online não se compara com a tabela ao milissegundo: compare sempre no mesmo dispositivo.</p>`,
      push: ['Meça o seu agora', 'Teste de reação no navegador, sem conta.', 'Fazer o teste'],
      after: `<h2>Meu tempo é normal?</h2>
    <p>Este guia é <strong>educativo</strong>: um teste online não serve para diagnosticar nada.</p>
    <p>As médias da tabela foram medidas em laboratório com equipamento calibrado; seu navegador e sua tela acrescentam o próprio atraso, então compare-se principalmente com você mesmo. Se notar que seus reflexos mudaram de repente, fale com um profissional de saúde.</p>`,
      faq: [['Em que idade o tempo de reação é mais rápido?', `No grupo mais jovem do estudo, de 18 a 24 anos: 217,9 ms de média. A partir daí, a média subiu em cada faixa etária até os 65 ${R('woods', 'tabela 2')}.`],
        ['Videogames melhoram os reflexos?', `Em tarefas de escolha rápida, jogadores de videogames de ação responderam 11% mais rápido que não jogadores, com a mesma precisão. Alguns estudos de treino indicam que jogar pode acelerar as respostas ${R('dye')}.`],
        ['Qual a diferença entre reação simples e de escolha?', `Na simples há um sinal e uma resposta, como no nosso teste. Na de escolha há vários sinais, cada um com sua resposta. Num estudo com 7.130 adultos, a reação simples quase não ficou mais lenta até por volta dos 50 anos, enquanto a de escolha ficou mais lenta ao longo de toda a vida adulta ${R('derdeary')}.`]],
      band: ['Treine seus reflexos todo dia', 'Pulse para Android: sem conta, funciona offline.'] } },

  'best-apps': { sources: [SRC.gp_pulse, SRC.gp_nix, SRC.gp_banen, SRC.gp_lumo, SRC.gp_peak, SRC.woods, SRC.dye],
    en: { title: 'Best reaction time apps for Android (2026), compared | Gurrulabs',
      desc: 'Best reaction time app Android? Five apps compared on price, ads, modes and offline use, from their Google Play listings. We make one of them and say so.',
      name: 'Best reaction time apps for Android', h1: 'Best reaction time apps for Android', card: 'Five apps compared, with sources',
      kick: 'Comparison · Reaction time', upd: 'Listings checked', note: 'Gurrulabs makes Pulse.',
      sub: 'Five apps compared on what their Google Play listings actually say: price, ads, modes, account and offline use. We make one of them, and say so.',
      answer: `If you only want to measure your reaction time, <b>Reaction Time</b> (Banensoft) is a simple reaction test plus a minigame; <b>Reaction training</b> (nixGames) adds 55+ reflex and puzzle challenges and a two-player mode; <b>Pulse</b> pairs a reaction test and Batak with two timing modes; <b>Lumosity</b> and <b>Peak</b> are general brain-training suites (Lumosity lists speed as one of its skill areas). All five are free to install; all but Lumosity show Play’s “Contains ads” label, and Lumosity offers Premium subscriptions. Full disclosure: <b>Pulse is made by Gurrulabs</b>, the authors of this page.`,
      body: `<h2>How we compared</h2>
    <p>Every fact in the table, ours included, comes from each app’s Google Play listing on the date above, nothing else. Where a listing does not say something, the table says “not stated” instead of guessing. The only exception is the Pulse card below: as its makers we add that it needs no account and works offline, which its listing does not state.</p>
    ${critList([['Price', ': free, free with in-app purchases, or subscription, as Play shows it.'], ['Ads', ': Play’s “Contains ads” label.'], ['Reaction modes', ': the kinds of test the description lists.'], ['Account', ' and <strong>offline use</strong>: only if the listing states it.']])}
    <h2>Comparison table</h2>
    ${cmpTable({ head: ['App', 'Price', 'Ads', 'Reaction modes', 'Account', 'Offline'], us: 'Gurrulabs · our app', free: 'Free', iap: 'Free + in-app purchases', sub: 'Free + subscription', yes: 'Yes', no: 'No', ns: 'Not stated', offl: 'Yes (offline mode)',
      modes: ['4 listed on Play: Reaction Time Test, Batak, Stop the Timer, Time Perception', '55+ puzzle and reflex challenges, incl. a colour-change test and a start-lights test; two-player mode', '1 reaction test (tap when the screen turns green) + a minigame', '40+ brain games; speed is one area, no reaction test named', '45+ brain games; no reaction test named'],
      cap: 'Source: each app’s Google Play listing (US, English), checked 6 November 2026 (links below).' })}
    <h2>Which one fits you</h2>
    ${picks([['A SIMPLE QUICK TEST', 'Reaction Time', 'One test: tap when the screen turns green. Free with in-app purchases and ads, plus an online leaderboard.'], ['MANY DRILLS, OR PLAY A FRIEND', 'Reaction training', '55+ challenges, including a start-lights test, and a two-player mode on one phone.'],
      ['REFLEXES AND TIMING', 'Pulse', 'A reaction test and Batak plus two timing modes. Our app; it needs no account and works offline.'], ['GENERAL BRAIN TRAINING', 'Lumosity or Peak', 'Brain games across memory, attention and more; Lumosity lists speed as one area. Lumosity offers Premium subscriptions; Peak lists an offline mode.']])}`,
      push: ['Try before you install anything', 'Reaction test in your browser, no account.', 'Take the test'],
      after: `<h2>What an app cannot tell you</h2>
    <p>Phones add their own touch and screen delay: screens, mice and software can add up to 100 ms to the measured time ${R('woods')}. So a time in one app is not comparable to the millisecond with another app or with lab figures. Compare yourself with yourself, on the same phone. See <a href="${to('en', 'age-guide')}">average reaction time by age</a> for what labs measure.</p>
    <p>This page is <strong>educational</strong>: no app here diagnoses anything.</p>`,
      faq: [['Is there a free reaction time app with no ads?', 'Of the five we compared, only Lumosity has no “Contains ads” label on Google Play, and it offers Premium subscriptions. The other four, Pulse included, show the label.'],
        ['Can a reflex app make me faster?', `Practice makes your own average more stable. On fast choice tasks, action video game players responded 11% faster than non-players with the same accuracy, and some training studies indicate that playing can speed up responses ${R('dye')}. No app can promise a specific gain.`],
        ['Why did you include your own app?', 'Because it is a reaction time app for Android. We compare it on the same criteria as the others.']],
      band: ['Train your reflexes every day', 'Pulse for Android: no account, works offline.'] },
    es: { title: 'Mejores apps de reflejos para Android (2026): comparativa | Gurrulabs',
      desc: '¿Cuál es la mejor app de reflejos Android? Cinco apps comparadas en precio, anuncios, modos y uso sin conexión, según Google Play. Hacemos una y lo decimos.',
      name: 'Mejores apps de reflejos para Android', h1: 'Mejores apps de reflejos para Android', card: 'Cinco apps comparadas, con fuentes',
      kick: 'Comparativa · Tiempo de reacción', upd: 'Fichas revisadas', note: 'Gurrulabs crea Pulse.',
      sub: 'Cinco apps comparadas según lo que dicen realmente sus fichas de Google Play: precio, anuncios, modos, cuenta y uso sin conexión. Hacemos una de ellas y lo decimos.',
      answer: `Si solo quieres medir tu tiempo de reacción, <b>Reaction Time</b> (Banensoft) es un test de reacción sencillo con un minijuego; <b>Reaction training</b> (nixGames) añade más de 55 retos de reflejos y puzles y un modo para dos jugadores; <b>Pulse</b> combina un test de reacción y Batak con dos modos de tiempo; <b>Lumosity</b> y <b>Peak</b> son suites generales de entrenamiento mental (Lumosity incluye la velocidad entre sus áreas). Las cinco son gratis de instalar; todas menos Lumosity muestran la etiqueta «Contiene anuncios» de Play, y Lumosity ofrece suscripciones Premium. Transparencia total: <b>Pulse es de Gurrulabs</b>, los autores de esta página.`,
      body: `<h2>Cómo las comparamos</h2>
    <p>Cada dato de la tabla, también los de nuestra app, sale de la ficha de Google Play de cada app en la fecha indicada arriba, y de nada más. Cuando una ficha no dice algo, la tabla pone «no indicado» en vez de adivinar. La única excepción es la tarjeta de Pulse de más abajo: como sus creadores, añadimos que no necesita cuenta y funciona sin conexión, algo que su ficha no indica.</p>
    ${critList([['Precio', ': gratis, gratis con compras en la app o suscripción, tal como lo muestra Play.'], ['Anuncios', ': la etiqueta «Contiene anuncios» de Play.'], ['Modos de reacción', ': los tipos de prueba que enumera la descripción.'], ['Cuenta', ' y <strong>uso sin conexión</strong>: solo si la ficha lo dice.']])}
    <h2>Tabla comparativa</h2>
    ${cmpTable({ head: ['App', 'Precio', 'Anuncios', 'Modos de reacción', 'Cuenta', 'Sin conexión'], us: 'Gurrulabs · nuestra app', free: 'Gratis', iap: 'Gratis + compras en la app', sub: 'Gratis + suscripción', yes: 'Sí', no: 'No', ns: 'No indicado', offl: 'Sí (modo sin conexión)',
      modes: ['4 en la ficha de Play: Reaction Time Test, Batak, Stop the Timer, Time Perception', 'Más de 55 retos de puzles y reflejos, incl. una prueba de cambio de color y otra de luces de salida; modo para dos jugadores', '1 test de reacción (toca cuando la pantalla se pone verde) + un minijuego', 'Más de 40 juegos mentales; la velocidad es un área, sin ningún test de reacción mencionado', 'Más de 45 juegos mentales; sin ningún test de reacción mencionado'],
      cap: 'Fuente: la ficha de Google Play de cada app (EE. UU., en inglés), revisada el 6 de noviembre de 2026 (enlaces abajo).' })}
    <h2>Cuál te conviene</h2>
    ${picks([['UN TEST RÁPIDO Y SENCILLO', 'Reaction Time', 'Una prueba: toca cuando la pantalla se pone verde. Gratis con compras en la app y anuncios, más una clasificación online.'], ['MUCHOS EJERCICIOS, O JUGAR CON UN AMIGO', 'Reaction training', 'Más de 55 retos, incluida una prueba de luces de salida, y un modo para dos jugadores en un mismo móvil.'],
      ['REFLEJOS Y TIEMPO', 'Pulse', 'Un test de reacción y Batak, más dos modos de tiempo. Es nuestra app; no necesita cuenta y funciona sin conexión.'], ['ENTRENAMIENTO MENTAL GENERAL', 'Lumosity o Peak', 'Juegos mentales de memoria, atención y más; Lumosity incluye la velocidad como un área. Lumosity ofrece suscripciones Premium; Peak indica un modo sin conexión.']])}`,
      push: ['Pruébalo antes de instalar nada', 'Test de reacción en el navegador, sin cuenta.', 'Hacer el test'],
      after: `<h2>Lo que una app no puede decirte</h2>
    <p>Los móviles añaden su propio retraso de pantalla y de toque: pantallas, ratones y software pueden sumar hasta 100 ms al tiempo medido ${R('woods')}. Por eso un tiempo en una app no se puede comparar al milisegundo con el de otra app ni con las cifras de laboratorio. Compárate contigo mismo, en el mismo móvil. Mira el <a href="${to('es', 'age-guide')}">tiempo de reacción medio por edad</a> para saber qué miden los laboratorios.</p>
    <p>Esta página es <strong>educativa</strong>: ninguna app de aquí diagnostica nada.</p>`,
      faq: [['¿Hay una app de tiempo de reacción gratis y sin anuncios?', 'De las cinco que comparamos, solo Lumosity no tiene la etiqueta «Contiene anuncios» en Google Play, y ofrece suscripciones Premium. Las otras cuatro, Pulse incluida, muestran la etiqueta.'],
        ['¿Una app de reflejos puede hacerme más rápido?', `La práctica hace que tu propia media sea más estable. En tareas de elección rápida, los jugadores de videojuegos de acción respondieron un 11 % más rápido que quienes no juegan, con la misma precisión, y algunos estudios de entrenamiento indican que jugar puede acelerar las respuestas ${R('dye')}. Ninguna app puede prometer una mejora concreta.`],
        ['¿Por qué incluís vuestra propia app?', 'Porque es una app de tiempo de reacción para Android. La comparamos con los mismos criterios que a las demás.']],
      band: ['Entrena tus reflejos cada día', 'Pulse para Android: sin cuenta, funciona sin conexión.'] },
    fr: { title: 'Meilleures applis de temps de réaction sur Android (2026) : comparatif | Gurrulabs',
      desc: 'Quelle meilleure application temps de réaction Android ? Cinq applis comparées (prix, pubs, modes, hors ligne) d’après Google Play. On en fait une, et on le dit.',
      name: 'Meilleures applis de temps de réaction sur Android', h1: 'Meilleures applis de temps de réaction sur Android', card: 'Cinq applis comparées, avec sources',
      kick: 'Comparatif · Temps de réaction', upd: 'Fiches vérifiées le', note: 'Gurrulabs développe Pulse.',
      sub: 'Cinq applis comparées d’après ce que disent vraiment leurs fiches Google Play : prix, publicités, modes, compte et usage hors ligne. On en fait une, et on le dit.',
      answer: `Si tu veux seulement mesurer ton temps de réaction, <b>Reaction Time</b> (Banensoft) est un test de réaction simple avec un mini-jeu ; <b>Reaction training</b> (nixGames) ajoute plus de 55 défis de réflexes et de puzzles et un mode deux joueurs ; <b>Pulse</b> associe un test de réaction et Batak à deux modes autour du temps ; <b>Lumosity</b> et <b>Peak</b> sont des suites générales d’entraînement cérébral (Lumosity cite la vitesse parmi ses domaines). Les cinq sont gratuites à installer ; toutes sauf Lumosity affichent la mention « Contient des annonces » de Play, et Lumosity propose des abonnements Premium. Transparence : <b>Pulse est fait par Gurrulabs</b>, les auteurs de cette page.`,
      body: `<h2>Comment on a comparé</h2>
    <p>Chaque information du tableau, y compris celles sur notre appli, vient de la fiche Google Play de chaque appli à la date indiquée plus haut, et de rien d’autre. Quand une fiche ne dit rien, le tableau écrit « non précisé » au lieu de deviner. La seule exception est la carte de Pulse plus bas : en tant que créateurs, on ajoute qu’elle n’a pas besoin de compte et fonctionne hors ligne, ce que sa fiche ne précise pas.</p>
    ${critList([['Prix', ' : gratuit, gratuit avec achats intégrés ou abonnement, comme l’affiche Play.'], ['Publicités', ' : la mention « Contient des annonces » de Play.'], ['Modes de réaction', ' : les types de test que la description énumère.'], ['Compte', ' et <strong>usage hors ligne</strong> : seulement si la fiche le précise.']])}
    <h2>Tableau comparatif</h2>
    ${cmpTable({ head: ['Appli', 'Prix', 'Pubs', 'Modes de réaction', 'Compte', 'Hors ligne'], us: 'Gurrulabs · notre appli', free: 'Gratuit', iap: 'Gratuit + achats intégrés', sub: 'Gratuit + abonnement', yes: 'Oui', no: 'Non', ns: 'Non précisé', offl: 'Oui (mode hors ligne)',
      modes: ['4 listés sur Play : Reaction Time Test, Batak, Stop the Timer, Time Perception', 'Plus de 55 défis de puzzles et de réflexes, dont un test de changement de couleur et un test de feux de départ ; mode deux joueurs', '1 test de réaction (touche quand l’écran devient vert) + un mini-jeu', 'Plus de 40 jeux cérébraux ; la vitesse est un domaine, aucun test de réaction cité', 'Plus de 45 jeux cérébraux ; aucun test de réaction cité'],
      cap: 'Source : la fiche Google Play de chaque appli (États-Unis, en anglais), vérifiée le 6 novembre 2026 (liens ci-dessous).' })}
    <h2>Laquelle te convient</h2>
    ${picks([['UN TEST RAPIDE ET SIMPLE', 'Reaction Time', 'Un seul test : touche quand l’écran devient vert. Gratuit avec achats intégrés et pubs, plus un classement en ligne.'], ['BEAUCOUP D’EXERCICES, OU JOUER À DEUX', 'Reaction training', 'Plus de 55 défis, dont un test de feux de départ, et un mode deux joueurs sur un seul téléphone.'],
      ['RÉFLEXES ET TEMPS', 'Pulse', 'Un test de réaction et Batak, plus deux modes autour du temps. C’est notre appli ; elle n’a pas besoin de compte et fonctionne hors ligne.'], ['ENTRAÎNEMENT CÉRÉBRAL GÉNÉRAL', 'Lumosity ou Peak', 'Des jeux cérébraux de mémoire, d’attention et plus ; Lumosity cite la vitesse comme un domaine. Lumosity propose des abonnements Premium ; Peak indique un mode hors ligne.']])}`,
      push: ['Essaie avant d’installer quoi que ce soit', 'Test de réaction dans ton navigateur, sans compte.', 'Faire le test'],
      after: `<h2>Ce qu’une appli ne peut pas te dire</h2>
    <p>Les téléphones ajoutent leur propre délai d’écran et de toucher : écrans, souris et logiciels peuvent ajouter jusqu’à 100 ms au temps mesuré ${R('woods')}. Un temps obtenu dans une appli ne se compare donc pas à la milliseconde près à celui d’une autre appli ni aux chiffres de laboratoire. Compare-toi à toi-même, sur le même téléphone. Va voir le <a href="${to('fr', 'age-guide')}">temps de réaction moyen par âge</a> pour savoir ce que mesurent les laboratoires.</p>
    <p>Cette page est <strong>éducative</strong> : aucune appli ici ne pose de diagnostic.</p>`,
      faq: [['Existe-t-il une appli de temps de réaction gratuite et sans pubs ?', 'Parmi les cinq comparées, seule Lumosity n’a pas la mention « Contient des annonces » sur Google Play, et elle propose des abonnements Premium. Les quatre autres, Pulse comprise, affichent la mention.'],
        ['Une appli de réflexes peut-elle me rendre plus rapide ?', `L’entraînement rend ta propre moyenne plus stable. Sur des tâches de choix rapide, les joueurs de jeux vidéo d’action ont répondu 11 % plus vite que les non-joueurs, avec la même précision, et des études d’entraînement indiquent que jouer peut accélérer les réponses ${R('dye')}. Aucune appli ne peut promettre un gain précis.`],
        ['Pourquoi avoir inclus votre propre appli ?', 'Parce que c’est une appli de temps de réaction pour Android. On la compare avec les mêmes critères que les autres.']],
      band: ['Entraîne tes réflexes chaque jour', 'Pulse pour Android : sans compte, fonctionne hors ligne.'] },
    pt: { title: 'Melhores apps de reflexo para Android (2026): comparativo | Gurrulabs',
      desc: 'Qual o melhor app de reflexo Android? Cinco apps comparados em preço, anúncios, modos e uso offline, pelo Google Play. Fazemos um deles e dizemos isso.',
      name: 'Melhores apps de reflexo para Android', h1: 'Melhores apps de reflexo para Android', card: 'Cinco apps comparados, com fontes',
      kick: 'Comparativo · Tempo de reação', upd: 'Fichas conferidas', note: 'A Gurrulabs faz o Pulse.',
      sub: 'Cinco apps comparados pelo que as fichas do Google Play realmente dizem: preço, anúncios, modos, conta e uso offline. Fazemos um deles e dizemos isso.',
      answer: `Se você só quer medir seu tempo de reação, o <b>Reaction Time</b> (Banensoft) é um teste de reação simples com um minijogo; o <b>Reaction training</b> (nixGames) acrescenta mais de 55 desafios de reflexo e quebra-cabeça e um modo para dois jogadores; o <b>Pulse</b> reúne um teste de reação e o Batak com dois modos de tempo; o <b>Lumosity</b> e o <b>Peak</b> são suítes gerais de treino cerebral (o Lumosity lista a velocidade entre suas áreas). Os cinco são grátis para instalar; todos menos o Lumosity mostram o selo “Contém anúncios” do Google Play, e o Lumosity oferece assinaturas Premium. Transparência total: o <b>Pulse é feito pela Gurrulabs</b>, autora desta página.`,
      body: `<h2>Como comparamos</h2>
    <p>Cada dado da tabela, inclusive os do nosso app, vem da ficha do Google Play de cada app na data indicada acima, e de mais nada. Quando uma ficha não diz algo, a tabela escreve “não informado” em vez de chutar. A única exceção é o card do Pulse abaixo: como criadores dele, acrescentamos que não precisa de conta e funciona offline, o que a ficha não informa.</p>
    ${critList([['Preço', ': grátis, grátis com compras no app ou assinatura, como o Play mostra.'], ['Anúncios', ': o selo “Contém anúncios” do Play.'], ['Modos de reação', ': os tipos de teste que a descrição lista.'], ['Conta', ' e <strong>uso offline</strong>: só se a ficha informar.']])}
    <h2>Tabela comparativa</h2>
    ${cmpTable({ head: ['App', 'Preço', 'Anúncios', 'Modos de reação', 'Conta', 'Offline'], us: 'Gurrulabs · nosso app', free: 'Grátis', iap: 'Grátis + compras no app', sub: 'Grátis + assinatura', yes: 'Sim', no: 'Não', ns: 'Não informado', offl: 'Sim (modo offline)',
      modes: ['4 listados no Play: Reaction Time Test, Batak, Stop the Timer, Time Perception', 'Mais de 55 desafios de quebra-cabeça e reflexo, incl. um teste de mudança de cor e um de luzes de largada; modo para dois jogadores', '1 teste de reação (toque quando a tela ficar verde) + um minijogo', 'Mais de 40 jogos cerebrais; velocidade é uma área, nenhum teste de reação citado', 'Mais de 45 jogos cerebrais; nenhum teste de reação citado'],
      cap: 'Fonte: a ficha do Google Play de cada app (EUA, em inglês), conferida em 6 de novembro de 2026 (links abaixo).' })}
    <h2>Qual combina com você</h2>
    ${picks([['UM TESTE RÁPIDO E SIMPLES', 'Reaction Time', 'Um teste: toque quando a tela ficar verde. Grátis com compras no app e anúncios, mais um ranking online.'], ['MUITOS EXERCÍCIOS, OU JOGAR COM UM AMIGO', 'Reaction training', 'Mais de 55 desafios, incluindo um teste de luzes de largada, e um modo para dois jogadores no mesmo celular.'],
      ['REFLEXOS E TEMPO', 'Pulse', 'Um teste de reação e o Batak, mais dois modos de tempo. É o nosso app; não precisa de conta e funciona offline.'], ['TREINO CEREBRAL GERAL', 'Lumosity ou Peak', 'Jogos cerebrais de memória, atenção e mais; o Lumosity lista a velocidade como uma área. O Lumosity oferece assinaturas Premium; o Peak informa um modo offline.']])}`,
      push: ['Teste antes de instalar qualquer coisa', 'Teste de reação no navegador, sem conta.', 'Fazer o teste'],
      after: `<h2>O que um app não pode dizer</h2>
    <p>Os celulares acrescentam o próprio atraso de tela e de toque: telas, mouses e software podem somar até 100 ms ao tempo medido ${R('woods')}. Por isso um tempo num app não se compara ao milissegundo com o de outro app nem com os números de laboratório. Compare-se com você mesmo, no mesmo celular. Veja o <a href="${to('pt', 'age-guide')}">tempo de reação médio por idade</a> para saber o que os laboratórios medem.</p>
    <p>Esta página é <strong>educativa</strong>: nenhum app daqui diagnostica nada.</p>`,
      faq: [['Existe um app de tempo de reação grátis e sem anúncios?', 'Dos cinco que comparamos, só o Lumosity não tem o selo “Contém anúncios” no Google Play, e ele oferece assinaturas Premium. Os outros quatro, Pulse inclusive, mostram o selo.'],
        ['Um app de reflexo pode me deixar mais rápido?', `A prática deixa sua própria média mais estável. Em tarefas de escolha rápida, jogadores de videogames de ação responderam 11% mais rápido que não jogadores, com a mesma precisão, e alguns estudos de treino indicam que jogar pode acelerar as respostas ${R('dye')}. Nenhum app pode prometer um ganho específico.`],
        ['Por que vocês incluíram o próprio app?', 'Porque é um app de tempo de reação para Android. Comparamos com os mesmos critérios dos outros.']],
      band: ['Treine seus reflexos todo dia', 'Pulse para Android: sem conta, funciona offline.'] } },

  '3s-challenge': { sources: [SRC.gibbon, SRC.haigh, SRC.poppel],
    en: { title: '3 second challenge: stop the clock at 3.00 s | Gurrulabs',
      desc: 'Can you stop the stopwatch at exactly 3.00 s? Play in your browser with a ±0.10 s window and find out why it is so hard to nail.',
      name: '3 second challenge', h1: '3 second challenge', card: 'Stop the stopwatch at exactly 3.00 s',
      kick: 'Stopwatch challenge', sub: 'Stop the stopwatch at exactly 3.00 s. Looks easy until you try: you have a ±0.10 s window, and hitting 3.00 on the dot is another story.',
      facts: ['No account', 'Space bar to stop'],
      body: `<h2>The rules</h2>
    ${rulesBlock(['Perfect: dead on, to the hundredth', 'Pass: within ±0.10 s', 'Miss: too early or too late'])}
    <h2>How to play</h2>
    <div class="answer ex">Press <b>Start</b>, count three seconds and press <b>Stop</b>. The clock is in view, so the challenge is not guessing, it is <b>not missing by rushing or hesitating</b>.</div>
    <h2>Why hitting 3 seconds is so hard</h2>
    <p>Because the brain has no exact stopwatch: estimating an interval always involves some error, and that error tends to grow with the duration.</p>
    <p>This is called the scalar property of timing. In animals, the spread of their timing is proportional to the interval: a constant coefficient of variation ${R('gibbon')}. In people, a study with intervals from 0.1 to 3.2 s found that Weber’s law (the smallest difference you notice grows in proportion to the duration) best described sensitivity to changes in duration, although time perception is not entirely scalar ${R('haigh')}.</p>
    <p>On top of that, in Pöppel’s model the brain binds events into perceptual units of about 3 seconds, which serve to define the “subjective present” ${R('poppel')}.</p>
    <h2>Tips to get closer to 3.00</h2>
    <p>Watch the ring, not just the numbers, and repeat.</p>
    <ul><li><strong>Don’t just watch the numbers.</strong> Follow the ring: one full turn is 3 seconds.</li><li><strong>Repeat.</strong> Each try gives you a reference for the next one; compare it with the last.</li><li><strong>Test your reaction too.</strong> Here you decide when to stop; in the <a href="${to('en', 'reaction-test')}">reaction time test</a> you respond to a signal. They are two different skills.</li></ul>`,
      push: ['What about without the clock?', 'In Pulse, Hidden Clock hides the stopwatch, and there are more targets.'],
      faq: [['Can you cheat?', 'With the clock in view, anyone gets close. The skill is nailing it to the hundredth. For the real challenge, Pulse has Hidden Clock: the clock disappears.'],
        ['Why 3 seconds?', 'Because 3 s is an Exact Time target in the app and each try is short. Pulse has more targets.'],
        ['Does it work on a phone?', 'Yes, in any browser. Tap the button to start and to stop; on a computer you can also stop with the space bar.']],
      band: ['Your best is waiting', 'More targets, a hidden clock and a daily challenge in the app.'] },
    es: { title: 'Reto de los 3 segundos: para el reloj en 3.00 s | Gurrulabs',
      desc: '¿Puedes parar el cronómetro en 3.00 s exactos? Juega en el navegador, con margen de ±0.10 s, y descubre por qué cuesta tanto clavarlo.',
      name: 'Reto de los 3 segundos', h1: 'Reto de los 3 segundos', card: 'Para el cronómetro en 3.00 s exactos',
      kick: 'Reto de cronómetro', sub: 'Para el cronómetro en 3.00 s exactos. Parece fácil hasta que lo intentas: tienes ±0.10 s de margen, y clavar el 3.00 es otra historia.',
      facts: ['Sin cuenta', 'Barra espaciadora para parar'],
      body: `<h2>Las reglas</h2>
    ${rulesBlock(['Perfecto: clavado a la centésima', 'Superado: dentro de ±0.10 s', 'Fallo: demasiado pronto o tarde'])}
    <h2>Cómo se juega</h2>
    <div class="answer ex">Pulsa <b>Iniciar</b>, cuenta tres segundos y pulsa <b>Parar</b>. El reloj está a la vista, así que el reto no es adivinar, sino <b>no fallar por anticiparte o por dudar</b>.</div>
    <h2>Por qué es tan difícil clavar 3 segundos</h2>
    <p>Porque el cerebro no lleva un cronómetro exacto: al estimar un intervalo siempre hay algo de error, y ese error tiende a crecer con la duración.</p>
    <p>Es la llamada propiedad escalar del tiempo. En animales, la variación de sus estimaciones es proporcional al intervalo: un coeficiente de variación constante ${R('gibbon')}. En personas, un estudio con intervalos de 0,1 a 3,2 s encontró que la ley de Weber (la diferencia mínima que notas crece en proporción a la duración) era la que mejor describía la sensibilidad a los cambios de duración, aunque la percepción del tiempo no es del todo escalar ${R('haigh')}.</p>
    <p>Además, según el modelo de Pöppel, el cerebro agrupa los sucesos en unidades de unos 3 segundos, que sirven para definir el «presente subjetivo» ${R('poppel')}.</p>
    <h2>Trucos para acercarte al 3.00</h2>
    <p>Mira el anillo, no solo los números, y repite.</p>
    <ul><li><strong>No mires solo los números.</strong> Sigue el anillo: una vuelta completa son 3 segundos.</li><li><strong>Repite.</strong> Cada intento te deja una referencia para el siguiente; compáralo con el anterior.</li><li><strong>Prueba también tu reacción.</strong> Aquí eres tú quien decide cuándo parar; en el <a href="${to('es', 'reaction-test')}">test de tiempo de reacción</a> respondes a una señal. Son dos habilidades distintas.</li></ul>`,
      push: ['¿Y sin ver el reloj?', 'En Pulse, Hidden Clock esconde el cronómetro y hay más objetivos.'],
      faq: [['¿Se puede hacer trampa?', 'Mirando el reloj, cualquiera se acerca. El mérito es clavarlo a la centésima. Para el reto de verdad, Pulse tiene Hidden Clock: el reloj desaparece.'],
        ['¿Por qué 3 segundos?', 'Porque 3 s es un objetivo de Exact Time en la app y cada intento dura poco. En Pulse hay más objetivos.'],
        ['¿Funciona en el móvil?', 'Sí, en cualquier navegador. Toca el botón para iniciar y para parar; en el ordenador también puedes parar con la barra espaciadora.']],
      band: ['Tu mejor marca te espera', 'Más objetivos, reloj oculto y un reto diario en la app.'] },
    fr: { title: 'Défi des 3 secondes : arrête le chrono à 3.00 s | Gurrulabs',
      desc: 'Peux-tu arrêter le chrono pile à 3.00 s ? Joue dans ton navigateur, avec une marge de ±0.10 s, et découvre pourquoi c’est si dur à réussir.',
      name: 'Défi des 3 secondes', h1: 'Défi des 3 secondes', card: 'Arrête le chrono pile à 3.00 s',
      kick: 'Défi chrono', sub: 'Arrête le chrono pile à 3.00 s. Ça paraît facile jusqu’à ce que tu essaies : tu as ±0.10 s de marge, et tomber pile sur 3.00, c’est une autre histoire.',
      facts: ['Sans compte', 'Barre d’espace pour arrêter'],
      body: `<h2>Les règles</h2>
    ${rulesBlock(['Parfait : pile au centième', 'Réussi : à ±0.10 s près', 'Raté : trop tôt ou trop tard'])}
    <h2>Comment jouer</h2>
    <div class="answer ex">Appuie sur <b>Démarrer</b>, compte trois secondes et appuie sur <b>Arrêter</b>. Le chrono est visible : le défi n’est pas de deviner, mais de <b>ne pas rater en te précipitant ou en hésitant</b>.</div>
    <h2>Pourquoi c’est si dur de tomber pile sur 3 secondes</h2>
    <p>Parce que le cerveau n’a pas de chronomètre exact : estimer un intervalle comporte toujours une erreur, et cette erreur tend à grandir avec la durée.</p>
    <p>C’est ce qu’on appelle la propriété scalaire du temps. Chez l’animal, la dispersion des estimations est proportionnelle à l’intervalle : un coefficient de variation constant ${R('gibbon')}. Chez l’humain, une étude avec des intervalles de 0,1 à 3,2 s a montré que la loi de Weber (la plus petite différence perçue grandit en proportion de la durée) décrivait le mieux la sensibilité aux changements de durée, même si la perception du temps n’est pas entièrement scalaire ${R('haigh')}.</p>
    <p>En plus, selon le modèle de Pöppel, le cerveau regroupe les événements en unités d’environ 3 secondes, qui servent à définir le « présent subjectif » ${R('poppel')}.</p>
    <h2>Astuces pour t’approcher du 3.00</h2>
    <p>Regarde l’anneau, pas seulement les chiffres, et recommence.</p>
    <ul><li><strong>Ne regarde pas que les chiffres.</strong> Suis l’anneau : un tour complet, ce sont 3 secondes.</li><li><strong>Recommence.</strong> Chaque essai te donne un repère pour le suivant ; compare-le avec le précédent.</li><li><strong>Teste aussi ta réaction.</strong> Ici, c’est toi qui décides quand arrêter ; dans le <a href="${to('fr', 'reaction-test')}">test de temps de réaction</a>, tu réponds à un signal. Ce sont deux compétences différentes.</li></ul>`,
      push: ['Et sans voir le chrono ?', 'Dans Pulse, Hidden Clock cache le chronomètre, et il y a plus de cibles.'],
      faq: [['Peut-on tricher ?', 'En regardant le chrono, tout le monde s’approche. Le mérite, c’est de tomber pile au centième. Pour le vrai défi, Pulse a Hidden Clock : l’horloge disparaît.'],
        ['Pourquoi 3 secondes ?', 'Parce que 3 s est une cible d’Exact Time dans l’appli et que chaque essai est court. Pulse propose plus de cibles.'],
        ['Ça marche sur téléphone ?', 'Oui, dans n’importe quel navigateur. Touche le bouton pour démarrer et pour arrêter ; sur ordinateur, tu peux aussi arrêter avec la barre d’espace.']],
      band: ['Ton record t’attend', 'Plus de cibles, une horloge cachée et un défi chaque jour dans l’appli.'] },
    pt: { title: 'Desafio dos 3 segundos: pare o relógio em 3.00 s | Gurrulabs',
      desc: 'Você consegue parar o cronômetro em 3.00 s exatos? Jogue no navegador, com margem de ±0.10 s, e descubra por que é tão difícil acertar.',
      name: 'Desafio dos 3 segundos', h1: 'Desafio dos 3 segundos', card: 'Pare o cronômetro em 3.00 s exatos',
      kick: 'Desafio de cronômetro', sub: 'Pare o cronômetro em 3.00 s exatos. Parece fácil até você tentar: você tem ±0.10 s de margem, e cravar o 3.00 é outra história.',
      facts: ['Sem conta', 'Barra de espaço para parar'],
      body: `<h2>As regras</h2>
    ${rulesBlock(['Perfeito: cravado no centésimo', 'Passou: dentro de ±0.10 s', 'Errou: cedo ou tarde demais'])}
    <h2>Como jogar</h2>
    <div class="answer ex">Toque em <b>Iniciar</b>, conte três segundos e toque em <b>Parar</b>. O relógio está à vista, então o desafio não é adivinhar, e sim <b>não errar por se adiantar ou por hesitar</b>.</div>
    <h2>Por que é tão difícil cravar 3 segundos</h2>
    <p>Porque o cérebro não tem um cronômetro exato: estimar um intervalo sempre envolve algum erro, e esse erro tende a crescer com a duração.</p>
    <p>É a chamada propriedade escalar do tempo. Em animais, a variação das estimativas é proporcional ao intervalo: um coeficiente de variação constante ${R('gibbon')}. Em pessoas, um estudo com intervalos de 0,1 a 3,2 s concluiu que a lei de Weber (a menor diferença que você percebe cresce na proporção da duração) era a que melhor descrevia a sensibilidade a mudanças de duração, embora a percepção do tempo não seja totalmente escalar ${R('haigh')}.</p>
    <p>Além disso, no modelo de Pöppel, o cérebro agrupa os eventos em unidades de cerca de 3 segundos, que servem para definir o “presente subjetivo” ${R('poppel')}.</p>
    <h2>Dicas para chegar perto do 3.00</h2>
    <p>Olhe o anel, não só os números, e repita.</p>
    <ul><li><strong>Não olhe só os números.</strong> Siga o anel: uma volta completa são 3 segundos.</li><li><strong>Repita.</strong> Cada tentativa dá uma referência para a próxima; compare com a anterior.</li><li><strong>Teste também sua reação.</strong> Aqui é você quem decide quando parar; no <a href="${to('pt', 'reaction-test')}">teste de tempo de reação</a> você responde a um sinal. São duas habilidades diferentes.</li></ul>`,
      push: ['E sem ver o relógio?', 'No Pulse, o Hidden Clock esconde o cronômetro, e há mais alvos.'],
      faq: [['Dá para trapacear?', 'Olhando o relógio, qualquer um chega perto. O mérito é cravar no centésimo. Para o desafio de verdade, o Pulse tem o Hidden Clock: o relógio some.'],
        ['Por que 3 segundos?', 'Porque 3 s é um alvo do Exact Time no app e cada tentativa é curta. No Pulse há mais alvos.'],
        ['Funciona no celular?', 'Sim, em qualquer navegador. Toque no botão para iniciar e para parar; no computador, você também pode parar com a barra de espaço.']],
      band: ['Seu recorde está esperando', 'Mais alvos, um relógio escondido e um desafio diário no app.'] } },
};
const meta = (loc, p) => p.id === 'home' ? { title: T[loc].home_title, desc: T[loc].home_desc }
  : p.id === 'pulse' ? { title: T[loc].pulse_title, desc: T[loc].pulse_desc } : CONTENT[p.id][loc];

// ── Icons (Pulse's set, 24 grid)
const SYM = {
  exact: '<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>', hidden: '<path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z"/><path d="M4 20L20 4"/>',
  interval: '<path d="M5 6v12M19 6v12M5 12h14"/>', reaction: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  batak: '<circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  back: '<path d="M15 5l-7 7 7 7"/>', out: '<path d="M7 17L17 7M9 7h8v8"/>', check: '<path d="M5 12l5 5 9-10"/>', chev: '<path d="M9 5l7 7-7 7"/>',
  chart: '<path d="M5 19V9M12 19V5M19 19v-7"/>',
};
const ic = id => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${SYM[id]}</svg>`;
const img = (name, alt = '') => `<img src="/assets/${name}-icon.webp" width="256" height="256" alt="${alt}">`;
// Lull has no icon file yet: drawn mark in its colours
const LULL_ICON = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#17121A"/><circle cx="32" cy="32" r="18" fill="none" stroke="#C9B6E4" stroke-opacity=".35" stroke-width="2"/><circle cx="32" cy="32" r="12" fill="none" stroke="#C9B6E4" stroke-opacity=".65" stroke-width="2"/><circle cx="32" cy="32" r="6" fill="#F0B48A"/></svg>';
const ICON = { pulse: img('pulse'), raffy: img('raffy'), cyber: img('cyberpunk'), lull: LULL_ICON };

// ── Helpers
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const PLAY_URL = app => `https://play.google.com/store/apps/details?id=${PKG[app]}`;
const play = (loc, app, cta) => `<a class="gp" href="${PLAY_URL(app)}" target="_blank" rel="noopener" data-cta="${cta}" data-app="${app}"><img src="/assets/play-badge-${loc}.webp" width="594" height="198" alt="${BADGE_ALT[loc]}"></a>`;
const alternates = p => [...LOCALES.map(l => `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${url(l, p)}">`), `<link rel="alternate" hreflang="x-default" href="${url('en', p)}">`].join('\n');
const jsonLd = o => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...o }).replace(/</g, '\\u003c')}</script>`;

// JSON-LD per page type. Names/headlines are the visible h1; dates are the visible <time> values (validator compares).
function schema(loc, p) {
  const t = T[loc], c = CONTENT[p.id]?.[loc], me = url(loc, p);
  const org = { '@type': 'Organization', name: 'Gurrulabs', url: url(loc, byId.home) };
  const pulseApp = { '@type': 'MobileApplication', name: 'Pulse', operatingSystem: 'Android', applicationCategory: 'GameApplication', url: PLAY_URL('pulse'), inLanguage: HREFLANG[loc] };
  const out = [];
  if (p.type === 'home') out.push({ ...org, email: 'gurrulabs@gmail.com' });
  if (p.type === 'app') out.push(pulseApp);
  if (p.type === 'test' || p.type === 'challenge') out.push({ '@type': 'WebApplication', name: c.h1, url: me, applicationCategory: 'GameApplication', browserRequirements: 'Requires JavaScript', inLanguage: HREFLANG[loc], datePublished: p.published, dateModified: p.modified });
  if (p.type === 'guide') out.push({ '@type': 'Article', headline: c.h1, url: me, inLanguage: HREFLANG[loc], datePublished: p.published, dateModified: p.modified,
    author: org, publisher: org, citation: CONTENT[p.id].sources.map(s => s.url), about: { '@type': 'MobileApplication', name: 'Pulse', url: PLAY_URL('pulse') } });
  if (p.type !== 'home') {
    const trail = [[t.back, byId.home], ['Pulse', byId.pulse], ...(p.id === 'pulse' ? [] : [[c.name, p]])];
    out.push({ '@type': 'BreadcrumbList', itemListElement: trail.map(([name, q], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(loc, q) })) });
  }
  return out;
}

function head(loc, p) {
  const { title, desc } = meta(loc, p);
  const image = p.app === 'pulse' ? `${SITE}/assets/pulse-icon.webp` : '';
  return `<!doctype html>
<html lang="${HREFLANG[loc]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url(loc, p)}">
${alternates(p)}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url(loc, p)}">
<meta property="og:type" content="${p.type === 'guide' ? 'article' : 'website'}">
<meta property="og:locale" content="${OG_LOCALE[loc]}">
<meta property="og:site_name" content="Gurrulabs">${image ? `\n<meta property="og:image" content="${image}">` : ''}
<link rel="preload" href="/assets/outfit.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/styles.css">
${schema(loc, p).map(jsonLd).join('\n')}
<script src="/script.js" defer></script>
</head>`;
}

function header(loc, p, t) {
  const home = p.type === 'home';
  const [backHref, backName] = p.app && p.type !== 'app' ? [path(loc, byId.pulse), 'Pulse'] : [`/${loc}/`, t.back]; // content pages go back to their app
  const left = home
    ? `<a class="brand" href="/${loc}/"><span class="dot"></span>gurrulabs</a>`
    : `<a class="crumb" href="${backHref}">${ic('back')}<span class="brand" style="font-size:18px"><span class="dot"></span>${backName}</span></a>`;
  const nav = home ? `<nav class="hnav"><a href="#apps">${t.apps_h}</a><a href="#about">${t.about_h}</a></nav>` : '';
  const langs = LOCALES.map(l => `<a${l === loc ? ' class="on" aria-current="true"' : ''} href="${path(l, p)}" hreflang="${HREFLANG[l]}" lang="${HREFLANG[l]}">${l.toUpperCase()}</a>`).join('');
  return `<header class="wrap top">${left}${nav}<nav class="langs" aria-label="Language">${langs}</nav></header>`;
}

// Every page links every app (internal links help search engines find the app pages); Pulse pages also list Pulse's tests and guide
const footer = (loc, t, p) => `<footer><div class="wrap"><div class="fbig" aria-hidden="true">gurrulabs</div><nav class="fapps"><b>${t.apps_word}</b><a href="/${loc}/pulse/">Pulse</a>${p?.app === 'pulse' ? PULSE_CONTENT.map((q, i) => `<a href="${path(loc, q)}">${t.foot[i]}</a>`).join('') : ''}<a href="https://raffyparenting.com/">Raffy</a><a href="https://play.google.com/store/apps/details?id=${PKG.cyberpunk_detective}" target="_blank" rel="noopener" data-cta="footer" data-app="cyberpunk_detective">Cyberpunk Detective</a><span>Lull · ${t.soon}</span></nav><span>© 2026 Gurrulabs · ${t.contact}: <a href="mailto:gurrulabs@gmail.com">gurrulabs@gmail.com</a></span></div></footer>`;

// ── Home
function home(loc) {
  const t = T[loc], pulse = `/${loc}/pulse/`;
  const tile = (id, cls, art, icon, cat, name, p, acts) =>
    `<article class="tile ${cls}" id="${id}"><div class="art">${art}</div><div class="meta">
      <div class="row"><span class="ic">${icon}</span><span class="cat">${cat}</span></div>
      <h3>${name}</h3><p>${p}</p><div class="acts">${acts}</div></div></article>`;
  const tiles = [
    tile('pulse', 'w7 t-pulse pulse-scope',
      `<div class="pring"><svg viewBox="0 0 260 260" aria-hidden="true"><circle class="tr" cx="130" cy="130" r="120"/><circle class="pg" cx="130" cy="130" r="120"/></svg><div><small>${t.stop_at}</small><b class="tnum">3.00<span>s</span></b></div></div>`,
      ICON.pulse, t.cat[0], 'Pulse', t.pulse_short,
      `<a class="lnk" href="${pulse}">${t.pulse_page}${ic('chev')}</a>${play(loc, 'pulse', 'home_pulse_card')}`),
    tile('raffy', 'w5 t-raffy',
      t.raffy_chips.map(c => `<span class="chip2"><i></i>${c}</span>`).join('') + `<div class="bigic">${ICON.raffy}</div>`,
      ICON.raffy, t.cat[1], 'Raffy', t.raffy_p,
      `<a class="lnk" href="https://raffyparenting.com/">${t.raffy_cta}${ic('out')}</a>${play(loc, 'raffy', 'home_raffy_card')}`),
    tile('cyber', 'w5 t-cyber', `<div class="sun"></div><div class="floor"></div><div class="bigic">${ICON.cyber}</div>`,
      ICON.cyber, t.cat[2], 'Cyberpunk Detective', t.cyber_p, play(loc, 'cyberpunk_detective', 'home_cyberpunk_card')),
    tile('lull', 'w7 t-lull', `<div class="waves"><span></span><span></span><span></span><div class="bigic">${ICON.lull}</div></div>`,
      ICON.lull, t.cat[3], 'Lull', t.lull_p, `<span class="tag2">${t.soon}</span>`),
  ].join('\n    ');
  const p = byId.home;
  return `${head(loc, p)}
<body class="light" data-page="${p.dataPage}" data-locale="${loc}">
${header(loc, p, t)}
<main class="wrap">
  <section class="l-hero">
    <div>
      <p class="kick">${t.kick}</p>
      <h1>${t.home_h1}</h1>
      <p class="intro">${t.home_p}</p>
      <div class="hero-acts"><a class="btn" href="#apps">${t.see_apps}</a><a class="txtlink" href="${pulse}">${t.pulse_cta}${ic('chev')}</a></div>
    </div>
    <div class="orbit" aria-label="Apps"><a href="${pulse}" aria-label="Pulse">${ICON.pulse}</a><a href="#raffy" aria-label="Raffy">${ICON.raffy}</a><a href="#cyber" aria-label="Cyberpunk Detective">${ICON.cyber}</a><a href="#lull" aria-label="Lull">${ICON.lull}</a></div>
  </section>

  <section class="l-sec" id="apps">
    <div class="sec-h"><div><p class="kick">Gurrulabs</p><h2>${t.apps_h}</h2></div><p class="lead">${t.apps_p}</p></div>
    <div class="bento">
    ${tiles}
    </div>
  </section>

  <section class="about2" id="about">
    <div><p class="kick">${t.about_h}</p><h2 class="big">${t.about_big}</h2></div>
    <div><p class="body">${t.about_p}</p><ol class="plist">${t.pri.map(([h, p]) => `<li><div><b>${h}</b><span>${p}</span></div></li>`).join('')}</ol></div>
  </section>

  <section class="closer"><div><h2>${t.close_h}</h2><p>${t.close_p}</p></div><div><a class="lnk" href="${pulse}">${t.pulse_cta}${ic('chev')}</a></div></section>
</main>
${footer(loc, t)}
</body>
</html>
`;
}

// ── Pulse page
// Game panel (no-JS fallback inside); script.js turns it into the live test. attrs: ' data-mode="react" data-solo' for a single-mode page.
const gameBox = (loc, attrs = '') => `<div class="game" id="game"${attrs}><div class="nojs"><div style="width:72px;height:72px;border-radius:18px;overflow:hidden">${ICON.pulse}</div><p>${T[loc].nojs}</p>${play(loc, 'pulse', 'nojs')}</div></div>`;

function pulsePage(loc) {
  const t = T[loc], p = byId.pulse;
  const modes = ['exact', 'hidden', 'interval', 'reaction', 'batak'];
  const shots = [1, 2, 3, 4, 5].map(n => `<img class="shot" src="/assets/pulse-shot-${n}.webp" width="540" height="811" loading="lazy" alt="${SHOT_ALT[loc]} ${n}">`).join('');
  return `${head(loc, p)}
<body data-page="${p.dataPage}" data-locale="${loc}">
${header(loc, p, t)}
<main class="wrap">
  <section class="p-hero">
    <div class="txt">
      <div class="head">
        <div class="app"><div class="ic">${ICON.pulse}</div><div><b>Pulse</b><span>${t.p_kicker}</span></div></div>
        <h1>${t.p_h1}</h1>
        <p class="sub">${t.pulse_short}</p>
      </div>
      <div class="cta">${play(loc, 'pulse', 'hero')}</div>
      <div class="facts">${t.facts.map(f => `<span class="chip">${ic('check')}${f}</span>`).join('')}</div>
    </div>
    ${gameBox(loc)}
  </section>

  <section class="blk"><h2>${t.modes_h}</h2><p class="lead">${t.modes_p}</p><div class="modes">${t.m.map(([n, r], i) => `<div class="mrow" style="--c:var(--m-${modes[i]})"><span class="mi">${ic(modes[i])}</span><div class="tx"><b>${n}</b><span>${r}</span></div></div>`).join('')}</div></section>

  <section class="blk" id="guides"><h2>${t.guides_h}</h2><p class="lead">${t.guides_p}</p>${relBlock(loc, PULSE_CONTENT.map(q => q.id))}</section>

  <section class="blk"><h2>${t.shots_h}</h2><div class="shots">${shots}</div></section>

  <section class="band"><div><h2>${t.band_h}</h2><p>${t.band_p}</p></div><div>${play(loc, 'pulse', 'footer_band')}</div></section>
</main>
${footer(loc, t, p)}
<script type="application/json" id="i18n">${i18n(t)}</script>
</body>
</html>
`;
}

// ── Content pages (layout of the T-007 mockups). Everything is static HTML; only the game panel needs JS.
const fmtDate = (loc, iso) => { const [y, m, d] = iso.split('-').map(Number); return T[loc].date(d, T[loc].months[m - 1], y); };
// Reading time (guide): visible words of the article at 200 words/min, deterministic
const readMin = c => Math.max(1, Math.round([c.answer, c.body, c.after, ...c.faq.flat()].join(' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));
const dated = (loc, p, extra = '') => `<div class="dates"><span>${T[loc].pub} <b><time datetime="${p.published}">${fmtDate(loc, p.published)}</time></b></span><span>${CONTENT[p.id][loc].upd || T[loc].upd} <b><time datetime="${p.modified}">${fmtDate(loc, p.modified)}</time></b></span>${extra ? `<span>${extra}</span>` : ''}</div>`;
const SRC_KEY = new Map(Object.entries(SRC).map(([k, s]) => [s, k]));
const sourcesBlock = (loc, p) => `<section class="sources" id="sources" aria-labelledby="src-h"><h2 id="src-h">${T[loc].src_h}</h2><ol>${CONTENT[p.id].sources.map(s => `<li id="src-${SRC_KEY.get(s)}">${s.ref} <a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.url.replace('https://', ''))}</a></li>`).join('')}</ol><p class="note">${p.type === 'guide' ? T[loc].edu_med : T[loc].edu}${CONTENT[p.id][loc].note ? ' ' + CONTENT[p.id][loc].note : ''}</p></section>`;
const crumbBlock = (loc, p) => `<nav class="bc" aria-label="${T[loc].bc}"><a href="${path(loc, byId.home)}">${T[loc].back}</a><span aria-hidden="true">›</span><a href="${path(loc, byId.pulse)}">Pulse</a><span aria-hidden="true">›</span><span>${CONTENT[p.id][loc].name}</span></nav>`;
// Link cards to the content pages and the Pulse page (internal links), coloured by Pulse mode
const relCard = (loc, id) => id === 'pulse'
  ? `<a href="${to(loc, 'pulse')}" style="--c:var(--m-hidden)"><span class="mi">${ICON.pulse}</span><b>${T[loc].pulse_card[0]}</b><span>${T[loc].pulse_card[1]}</span></a>`
  : `<a href="${to(loc, id)}" style="--c:var(--${byId[id].card[1]})"><span class="mi">${ic(byId[id].card[0])}</span><b>${CONTENT[id][loc].name}</b><span>${CONTENT[id][loc].card}</span></a>`;
const relBlock = (loc, ids) => `<div class="rel">${ids.map(id => relCard(loc, id)).join('')}</div>`;
const faqBlock = (loc, faq) => `<h2>${T[loc].faq_h}</h2>
    <div class="faq">${faq.map(([q, a], i) => `<details${i ? '' : ' open'}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
// Test/challenge: Play link to Pulse. Guide: featured link to the reaction test.
const pushBlock = (loc, [b, s, go]) => `<div class="push"><div class="app"><div class="ic">${ICON.pulse}</div><div><b>${b}</b><span>${s}</span></div></div>${go
  ? `<a class="lnk" href="${to(loc, 'reaction-test')}" style="--bb:var(--m-reaction);--bf:#1A0A06">${go}${ic('chev')}</a>` : play(loc, 'pulse', 'article_push')}</div>`;

function contentPage(loc, p) {
  const t = T[loc], c = CONTENT[p.id][loc], guide = p.type === 'guide';
  const top = guide
    ? `<header class="art-h">
    <div class="app"><div class="ic">${ICON.pulse}</div><span>${c.kick}</span></div>
    <h1>${esc(c.h1)}</h1>
    <p class="sub">${c.sub}</p>
    ${dated(loc, p, t.read(readMin(c)))}
  </header>
  <div class="answer">${c.answer}</div>`
    : `<section class="p-hero">
    <div class="txt">
      <div class="head">
        <div class="app"><div class="ic">${ICON.pulse}</div><div><b>Pulse</b><span>${c.kick}</span></div></div>
        <h1>${esc(c.h1)}</h1>
        <p class="sub">${c.sub}</p>
      </div>
      <div class="cta">${play(loc, 'pulse', 'hero')}</div>
      <div class="facts">${c.facts.map(f => `<span class="chip">${ic('check')}${f}</span>`).join('')}</div>
    </div>
    ${gameBox(loc, ` data-mode="${p.type === 'test' ? 'react' : 'exact'}" data-solo`)}
  </section>
  ${dated(loc, p)}`;
  return `${head(loc, p)}
<body data-page="${p.dataPage}" data-locale="${loc}">
${header(loc, p, t)}
<main class="wrap">
  ${crumbBlock(loc, p)}
  ${top}
  <article class="prose">
    ${c.body}
    ${pushBlock(loc, c.push)}
    ${c.after ? c.after + '\n    ' : ''}${faqBlock(loc, c.faq)}
  </article>
  ${sourcesBlock(loc, p)}
  <section class="blk"><h2>${guide ? t.read_h : t.keep_h}</h2>${relBlock(loc, [...PULSE_CONTENT.filter(q => q !== p).map(q => q.id), 'pulse'])}</section>
  <section class="band"><div><h2>${c.band[0]}</h2><p>${c.band[1]}</p></div><div>${play(loc, 'pulse', 'footer_band')}</div></section>
</main>
${footer(loc, t, p)}${guide ? '' : `\n<script type="application/json" id="i18n">${i18n(t)}</script>`}
</body>
</html>
`;
}

// ── Root: redirects by browser language; search engines read the hreflang links
const rootPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gurrulabs</title>
<meta name="description" content="${esc(T.en.home_desc)}">
<link rel="canonical" href="${url('en', byId.home)}">
${alternates(byId.home)}
<script>var l = (navigator.language || 'en').slice(0, 2).toLowerCase(); location.replace('/' + (['es', 'fr', 'pt'].indexOf(l) > -1 ? l : 'en') + '/');</script>
</head>
<body>
<noscript><p><a href="/en/">English</a> · <a href="/es/">Español</a> · <a href="/fr/">Français</a> · <a href="/pt/">Português</a></p></noscript>
</body>
</html>
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGES.flatMap(p => LOCALES.map(loc => `  <url>
    <loc>${url(loc, p)}</loc>
    <lastmod>${p.modified}</lastmod>
${[...LOCALES.map(l => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${url(l, p)}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en', p)}"/>`].join('\n')}
  </url>`)).join('\n')}
</urlset>
`;

// Search and AI crawlers named explicitly (all allowed). validate.mjs requires each of these.
const BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Bingbot'];
const robots = `User-agent: *\nAllow: /\n\n${BOTS.map(b => `User-agent: ${b}`).join('\n')}\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;

// llms.txt (llmstxt.org): facts only. Lists the EN URL of every page (validator rule) and the locale roots under Optional.
const llmsName = p => p.id === 'home' ? 'Gurrulabs' : p.id === 'pulse' ? 'Pulse' : CONTENT[p.id].en.name;
const llmsItem = p => `- [${llmsName(p)}](${url('en', p)}): ${p.llms}`;
const llms = `# Gurrulabs

> Independent one-person Android app studio. Apps: Pulse (reaction time and timing game), Raffy (baby tracker), Cyberpunk Detective (detective mysteries), Lull (tinnitus sleep sounds, not on Google Play yet).

## Studio

${llmsItem(byId.home)}

## Pulse

${PAGES.filter(p => p.app === 'pulse').map(llmsItem).join('\n')}
- [Pulse on Google Play](${PLAY_URL('pulse')}): Android download page.

## Other apps

- [Raffy](https://raffyparenting.com/): baby tracker for feeds, sleep and growth, with WHO charts.
- [Cyberpunk Detective](${PLAY_URL('cyberpunk_detective')}): detective mystery game for Android, on Google Play.
- Lull: sleep sounds and a daily diary for people with tinnitus. Not on Google Play yet.

## Optional

${[['es', 'Español'], ['fr', 'Français'], ['pt', 'Português']].map(([l, n]) => `- [${n}](${url(l, byId.home)}): studio home in ${n}.`).join('\n')}
`;

function write(rel, content) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}
for (const loc of LOCALES) for (const p of PAGES) {
  const html = p.type === 'home' ? home(loc) : p.type === 'app' ? pulsePage(loc) : contentPage(loc, p);
  write(`${path(loc, p).slice(1)}index.html`, html);
}
write('index.html', rootPage);
write('sitemap.xml', sitemap);
write('robots.txt', robots);
write('llms.txt', llms);
console.log(`built ${LOCALES.length * PAGES.length} pages + index.html, sitemap.xml, robots.txt, llms.txt`);
