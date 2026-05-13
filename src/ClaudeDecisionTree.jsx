import React, { useState } from 'react';

const decisionTree = {
  id: 'root',
  question: "Quel est ton besoin ?",
  options: [
    { label: "Réfléchir, écrire, chercher, analyser", next: 'thinking' },
    { label: "Automatiser une tâche", next: 'automate' },
    { label: "Manipuler un fichier précis", next: 'file' },
    { label: "Coder", next: 'code' },
  ],
};

const nodes = {
  thinking: {
    question: "C'est ponctuel ou récurrent ?",
    options: [
      { label: "Ponctuel — un sujet, une fois", next: 'chat' },
      { label: "Récurrent — même type de demande", next: 'project' },
      { label: "Recherche profonde sur un sujet", next: 'research' },
    ],
  },
  automate: {
    question: "À quelle fréquence et quelle complexité ?",
    options: [
      { label: "Tâche standardisée que je répète souvent", next: 'skill' },
      { label: "Workflow complexe sur fichiers/apps", next: 'cowork' },
      { label: "Action sur Gmail / Notion / Calendar / Drive", next: 'connector' },
    ],
  },
  file: {
    question: "Quel type de fichier ?",
    options: [
      { label: "Excel — créer de zéro", next: 'cowork-xlsx' },
      { label: "Excel — modifier / analyser un existant", next: 'addin-excel' },
      { label: "PowerPoint — créer de zéro", next: 'cowork-pptx' },
      { label: "PowerPoint — modifier un existant", next: 'addin-pptx' },
      { label: "Word / PDF / MD à produire", next: 'cowork-doc' },
      { label: "Traitement de masse de fichiers", next: 'cowork-mass' },
    ],
  },
  code: {
    question: "Quel niveau d'intervention ?",
    options: [
      { label: "Snippet ou explication rapide", next: 'chat' },
      { label: "Projet complet, debug, tests", next: 'claude-code' },
    ],
  },
};

const leaves = {
  chat: {
    tool: "Claude Chat",
    why: "Conversation rapide, brainstorm, rédaction one-shot, questions analytiques.",
    rules: [
      "Édite le premier message plutôt que d'enchaîner les corrections",
      "Au-delà de ~15 messages, demande un résumé et reprends dans une nouvelle conversation",
      "Active la recherche web dès que la question concerne le présent",
    ],
    tips: [
      "Démarre par : « Je veux |TASK| afin de |GOAL| » sans détail, puis « Pose-moi des questions en utilisant AskUserQuestion »",
      "Joins des fichiers .md plutôt que .pdf ou screenshots (économie massive de tokens)",
      "Pour corriger une partie : « Ne refais que la partie X, garde le reste »",
      "Regroupe plusieurs tâches en un seul message plutôt que d'enchaîner les prompts",
    ],
  },
  research: {
    tool: "Claude Chat — Deep Research",
    why: "Sujet large nécessitant des dizaines de sources et une synthèse structurée.",
    rules: [
      "Active 'Recherche approfondie' dans le chat",
      "Donne le contexte d'usage (rapport interne, décision business, veille)",
      "Précise le format de sortie attendu",
    ],
    tips: [
      "Pour les données très récentes ou pointues, double-check avec Perplexity",
      "Sur le droit / réglementation, Claude est un point de départ — jamais une source : vérifier sur les sources officielles",
    ],
  },
  project: {
    tool: "Claude Project",
    why: "Tâche récurrente avec contexte stable (mêmes documents, mêmes consignes).",
    rules: [
      "1 projet = 1 tâche récurrente",
      "Mets le contexte et les consignes dans les instructions du projet",
      "Joins les fichiers de référence stables (.md de préférence)",
    ],
    tips: [
      "Crée un fichier .md de référence : qui tu es, tes objectifs, tes méthodes, tes contraintes",
      "Si la tâche devient totalement standardisée, encapsule-la dans une skill",
      "Évite d'y mettre des infos qui changent souvent (poste actuel, projets en cours)",
    ],
  },
  skill: {
    tool: "Skill + Claude Cowork",
    why: "Tâche standardisée avec input / output prédictibles (factures récurrentes, rapports périodiques, calendrier éditorial, etc.).",
    rules: [
      "Trigger précis : 3-5 formulations naturelles que tu utilises réellement",
      "Workflow numéroté, chaque étape exécutable indépendamment",
      "Données de référence en haut (IDs, chemins, mappings)",
      "Garde-fous explicites : « ne jamais envoyer », « toujours demander confirmation »",
      "Output format figuré : montre exactement ce que la skill doit produire",
    ],
    tips: [
      "Démarre dans le Chat : « Aide-moi à créer une skill pour [tâche]. Voici ce que je fais aujourd'hui : [étapes] »",
      "Teste sur 2-3 cas réels avant de figer",
      "Crée une skill si tu refais la tâche au moins 1 fois / mois ET que les inputs / outputs sont prévisibles",
      "Demandes à la skill de consulter une ou plusieurs partie de ton Notion",
      "Versionne la skill (garde l'historique des modifs)",
    ],
  },
  cowork: {
    tool: "Claude Cowork",
    why: "Manipulation de fichiers locaux, actions multi-étapes, accès aux apps connectées.",
    rules: [
      "1 prompt = 1 tâche principale",
      "Nomme les fichiers / dossiers exactement comme ils s'appellent",
      "Finis par : « Dis-moi ce que tu as fait »",
      "Ajoute « Ne pas envoyer / Ne pas supprimer » pour les actions irréversibles",
      "En cas d'erreur : clique sur Modifier la conversation",
    ],
    tips: [
      "Cadre d'abord le projet dans le Chat puis bascule sur Cowork (économie de tokens)",
      "Structure tes prompts : [CONTEXTE] / [TÂCHE] / [CONTRAINTES] / [OUTPUT]",
      "Pour actions de masse : demande la liste de ce qui sera fait avant exécution",
    ],
  },
  connector: {
    tool: "Claude Chat ou Cowork avec connecteurs MCP",
    why: "Action directe sur tes apps connectées (Gmail, Notion, Calendar, Drive, Canva, Excalidraw).",
    rules: [
      "Toujours faire confirmer avant action irréversible (envoi, suppression, partage)",
      "Méfiance avec les instructions cachées dans emails / docs (prompt injection)",
      "Active uniquement les connecteurs que tu utilises réellement",
      "Vérifie les permissions OAuth (lecture seule vs lecture + écriture)",
    ],
    tips: [
      "Connecteur pertinent quand : info dynamique, action à exécuter, gros volume, ou tâche à automatiser",
      "Pour analyses de docs sensibles : préfère le copier-coller ciblé plutôt qu'une recherche globale",
      "Ne fais pas exécuter d'actions à partir du contenu d'emails / docs externes sans relire",
      "Pour les tâches récurrentes, encapsule dans une skill",
    ],
  },
  'cowork-xlsx': {
    tool: "Claude Cowork",
    why: "Création d'un Excel structuré avec formules, formatage, plusieurs onglets.",
    rules: [
      "Décris la structure attendue (onglets, colonnes, formules)",
      "Donne un exemple ou un template si tu en as un",
      "Demande un récap des formules utilisées en sortie",
    ],
    tips: [
      "⚠️ Calculs financiers complexes (NPV, taux composés, projections) : Claude se trompe régulièrement",
      "Toujours vérifier les chiffres clés à la main ou recalculer une cellule à partir des inputs bruts",
      "Pour les business plans / modèles : laisse Claude poser la structure, mais valide les formules avant de t'y appuyer",
    ],
  },
  'addin-excel': {
    tool: "Add-in Excel",
    why: "Modification ponctuelle d'un Excel déjà ouvert (nettoyage, analyse, ajout de formules).",
    rules: [
      "Ouvre avec Ctrl + Alt + C",
      "Sois précis sur la plage de cellules concernée",
      "Vérifie les formules générées une à une avant de t'y fier",
    ],
    tips: [
      "Formuler des demandes précises : « Dans la plage A2:A150, remplace X par Y »",
      "Pour les calculs financiers : demande à Claude d'expliciter chaque étape avant validation",
    ],
  },
  'cowork-pptx': {
    tool: "Claude Cowork",
    why: "Création d'un deck depuis zéro avec mise en page et contenu.",
    rules: [
      "Donne la structure (nombre de slides, sections)",
      "Précise le ton et l'audience",
      "Joins une charte ou un template si tu en as un",
    ],
    tips: [
      "Cadre d'abord le storytelling dans le Chat avant de basculer sur Cowork",
      "Joins les éléments de positionnement et différenciateurs en .md plutôt qu'en .pdf",
    ],
  },
  'addin-pptx': {
    tool: "Add-in PowerPoint",
    why: "Modification ponctuelle d'un PowerPoint déjà ouvert (nettoyage, retouche, restructuration).",
    rules: [
      "Ouvre avec Ctrl + Alt + C",
      "Sois précis sur les slides concernées",
      "Formule des demandes précises et ciblées",
    ],
    tips: [
      "Idéal pour ajuster un deck existant sans tout recréer",
      "Pour des modifications structurelles importantes, repasser par Cowork",
    ],
  },
  'cowork-doc': {
    tool: "Claude Cowork",
    why: "Production de documents Word, PDF ou Markdown avec mise en forme et structure.",
    rules: [
      "Précise format et destination (Word, PDF, MD)",
      "Indique l'audience et le ton",
      "Donne la structure attendue (sections, longueur)",
    ],
    tips: [
      "Pour les documents juridiques : Claude pose la structure, tu vérifies sur les sources officielles",
      "Pour des templates récurrents (lettres, courriers types) : encapsule dans une skill",
      "Préfère le .md en source quand tu joins des références (économie de tokens)",
    ],
  },
  'cowork-mass': {
    tool: "Claude Cowork",
    why: "Traitement de masse : tri, renommage, synthèse de PDFs, veille concurrentielle, consolidation de rapports.",
    rules: [
      "Cadre d'abord le projet dans le Chat avant Cowork",
      "Pour actions de masse : demande la liste de ce qui sera fait sans exécuter",
      "Ajoute systématiquement « Ne pas supprimer / Demande-moi avant d'exécuter »",
    ],
    tips: [
      "Exemples : tri / renommage de fichiers selon contenu, consolidation de PDFs, veille concurrentielle (web + docs internes)",
      "Si la tâche est récurrente, encapsule en skill après le premier run réussi",
      "Pour les .pdf / .txt qui ne contiennent que du texte : convertir en .md avant d'attaquer",
    ],
  },
  'claude-code': {
    tool: "Claude Code",
    why: "Travail sur un projet de code complet : écriture, debug, tests, refactoring.",
    rules: [
      "Lance-le depuis ton éditeur de code",
      "Demande des tests pour les fonctions critiques",
      "Fais valider le plan avant qu'il modifie beaucoup de fichiers",
    ],
    tips: [
      "Découpe les grosses missions en étapes : 1) lecture, 2) plan, 3) implémentation, 4) tests",
      "Pour apprendre, demande-lui d'expliquer ce qu'il fait à chaque étape",
    ],
  },
};

export default function ClaudeDecisionTree() {
  const [path, setPath] = useState(['root']);
  const current = path[path.length - 1];
  const isLeaf = !!leaves[current];
  const node = isLeaf ? leaves[current] : (current === 'root' ? decisionTree : nodes[current]);

  const reset = () => setPath(['root']);
  const back = () => setPath(path.slice(0, -1));

  return (
    <div style={styles.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0a; }
        .ct-btn { transition: all 0.2s ease; }
        .ct-btn:hover { transform: translateX(4px); background: #1a1a1a !important; border-color: #ff6b35 !important; }
        .ct-leaf-card { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .breadcrumb-step { transition: opacity 0.3s ease; }
        .ct-cta { transition: all 0.2s ease; }
        .ct-cta:hover { color: #ff6b35 !important; border-color: #ff6b35 !important; }
        .ct-cta-linkedin { color: #007EBB !important; border-color: #007EBB !important; }
        .ct-cta-linkedin:hover { color: #fff !important; border-color: #fff !important; }
        .ct-cta-linkedin:hover svg path[fill="#007EBB"] { fill: #fff; }
        .ct-cta-linkedin svg { transition: all 0.2s ease; vertical-align: middle; }
        .ct-cta-meet { color: #007EBB !important; border-color: #007EBB !important; }
        .ct-cta-meet:hover { color: #fff !important; border-color: #fff !important; }
        .ct-cta-meet svg { transition: all 0.2s ease; vertical-align: middle; }

        @media (max-width: 640px) {
          .ct-wrap { padding: 24px 18px !important; }
          .ct-title { font-size: 32px !important; }
          .ct-question { font-size: 22px !important; }
          .ct-leaf-tool { font-size: 28px !important; }
          .ct-leaf-card { padding: 28px 22px !important; }
          .ct-option { padding: 16px 18px !important; font-size: 15px !important; gap: 14px !important; }
          .ct-leaf-why { font-size: 16px !important; }
          .ct-footer-cta { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      <div className="ct-wrap" style={styles.wrap_inner}>
        <header style={styles.header}>
          <div style={styles.eyebrow}>YANN LESUEUR · MÉTHODE</div>
          <h1 className="ct-title" style={styles.title}>Quel outil Claude pour <em style={styles.em}>quoi</em> ?</h1>
          <div style={styles.subtitle}>Arbre de décision · clique pour avancer</div>
        </header>

        <div style={styles.breadcrumb}>
          {path.map((p, i) => {
            const label = p === 'root' ? decisionTree.question : (leaves[p]?.tool || nodes[p]?.question || p);
            return (
              <span key={i} className="breadcrumb-step" style={{ opacity: i === path.length - 1 ? 1 : 0.4 }}>
                {label}{i < path.length - 1 && <span style={styles.bcSep}>  ›  </span>}
              </span>
            );
          })}
        </div>

        <main style={styles.main}>
          {!isLeaf && (
            <>
              <h2 className="ct-question" style={styles.question}>{node.question}</h2>
              <div style={styles.options}>
                {node.options.map((opt, i) => (
                  <button
                    key={i}
                    className="ct-btn ct-option"
                    style={styles.option}
                    onClick={() => setPath([...path, opt.next])}
                  >
                    <span style={styles.optionNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={styles.optionLabel}>{opt.label}</span>
                    <span style={styles.optionArrow}>→</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {isLeaf && (
            <div className="ct-leaf-card" style={styles.leafCard}>
              <div style={styles.leafTag}>Recommandation</div>
              <h2 className="ct-leaf-tool" style={styles.leafTool}>{node.tool}</h2>
              <p className="ct-leaf-why" style={styles.leafWhy}>{node.why}</p>

              <div style={styles.tipsBlock}>
                <div style={styles.tipsTitle}>Règles d'or</div>
                <ul style={styles.tipsList}>
                  {node.rules.map((rule, i) => (
                    <li key={i} style={styles.tip}>
                      <span style={styles.tipMark}>★</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={styles.tipsBlock}>
                <div style={styles.tipsTitle}>Bonnes pratiques</div>
                <ul style={styles.tipsList}>
                  {node.tips.map((tip, i) => (
                    <li key={i} style={styles.tip}>
                      <span style={styles.tipMark}>—</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </main>

        <div style={styles.nav}>
          {path.length > 1 && (
            <button onClick={back} style={styles.navBtn}>← Retour</button>
          )}
          <button onClick={reset} style={{ ...styles.navBtn, ...styles.navBtnPrimary }}>
            ↺ Recommencer
          </button>
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerSig}>
            Yann Lesueur — méthode personnelle, partagée librement.
            <br />
            <span style={styles.footerNote}>Inspiré de la documentation Claude (Anthropic).</span>
          </div>
          <div className="ct-footer-cta" style={styles.footerCta}>
            <a
              href="https://www.linkedin.com/in/yann-lesueur/"
              target="_blank"
              rel="noopener noreferrer"
              className="ct-cta ct-cta-linkedin"
              style={styles.ctaLink}
            >
              <svg height="16" viewBox="0 0 72 72" width="16" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '7px', verticalAlign: 'middle'}}>
                <g fill="none" fillRule="evenodd">
                  <path d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,-8.11624501e-16 64,0 L8,0 C3.581722,8.11624501e-16 -5.41083001e-16,3.581722 0,8 L0,64 C5.41083001e-16,68.418278 3.581722,72 8,72 Z" fill="#007EBB"/>
                  <path d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z" fill="#FFF"/>
                </g>
              </svg>
              LinkedIn →
            </a>
            <a
              href="https://calendar.app.google/CjigxskD3E9jWsvT8"
              target="_blank"
              rel="noopener noreferrer"
              className="ct-cta ct-cta-meet"
              style={styles.ctaLink}
            >
              <svg viewBox="0 0 87.5 72" width="18" height="15" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '7px', verticalAlign: 'middle'}}>
                <defs><clipPath id="gm-sq"><rect width="57" height="72" rx="9"/></clipPath></defs>
                <g clipPath="url(#gm-sq)">
                  <rect width="28.5" height="36" fill="#EA4335"/>
                  <rect x="28.5" width="28.5" height="36" fill="#FBBC04"/>
                  <rect y="36" width="28.5" height="36" fill="#4285F4"/>
                  <rect x="28.5" y="36" width="28.5" height="36" fill="#34A853"/>
                  <rect x="14" y="14" width="29" height="44" fill="white"/>
                </g>
                <rect x="60" y="16" width="27.5" height="40" rx="3" fill="#34A853"/>
                <polygon points="60,22 60,50 72,36" fill="#1B873B"/>
              </svg>
              Discuter en visio →
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    fontFamily: "'Fraunces', Georgia, serif",
    background: '#0a0a0a',
    color: '#f5f1eb',
    minHeight: '100vh',
    width: '100%',
  },
  wrap_inner: {
    padding: '40px 32px',
    maxWidth: '780px',
    margin: '0 auto',
  },
  header: {
    borderBottom: '1px solid #2a2a2a',
    paddingBottom: '24px',
    marginBottom: '32px',
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.15em',
    color: '#ff6b35',
    marginBottom: '16px',
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '48px',
    fontWeight: 900,
    lineHeight: 1.05,
    margin: '0 0 12px 0',
    letterSpacing: '-0.02em',
  },
  em: {
    fontStyle: 'italic',
    fontWeight: 400,
    color: '#ff6b35',
  },
  subtitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '13px',
    color: '#888',
  },
  breadcrumb: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    color: '#888',
    marginBottom: '40px',
    minHeight: '18px',
  },
  bcSep: {
    color: '#444',
    margin: '0 4px',
  },
  main: {
    minHeight: '320px',
  },
  question: {
    fontFamily: "'Fraunces', serif",
    fontSize: '28px',
    fontWeight: 600,
    lineHeight: 1.2,
    margin: '0 0 32px 0',
    letterSpacing: '-0.01em',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  option: {
    background: '#0f0f0f',
    border: '1px solid #2a2a2a',
    color: '#f5f1eb',
    padding: '20px 24px',
    fontSize: '17px',
    fontFamily: "'Fraunces', serif",
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    borderRadius: '0',
  },
  optionNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    color: '#ff6b35',
    letterSpacing: '0.1em',
  },
  optionLabel: {
    flex: 1,
  },
  optionArrow: {
    color: '#666',
    fontSize: '18px',
  },
  leafCard: {
    background: '#0f0f0f',
    border: '1px solid #2a2a2a',
    borderLeft: '3px solid #ff6b35',
    padding: '40px 36px',
  },
  leafTag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.15em',
    color: '#ff6b35',
    marginBottom: '12px',
  },
  leafTool: {
    fontFamily: "'Fraunces', serif",
    fontSize: '40px',
    fontWeight: 900,
    margin: '0 0 16px 0',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  leafWhy: {
    fontFamily: "'Fraunces', serif",
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#c8c0b3',
    margin: '0 0 32px 0',
    fontStyle: 'italic',
  },
  tipsBlock: {
    borderTop: '1px solid #2a2a2a',
    paddingTop: '24px',
    marginBottom: '24px',
  },
  tipsTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.15em',
    color: '#888',
    marginBottom: '16px',
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  tip: {
    fontFamily: "'Fraunces', serif",
    fontSize: '15px',
    lineHeight: 1.5,
    padding: '6px 0',
    color: '#d4ccbe',
    borderLeft: '0',
  },
  tipMark: {
    color: '#ff6b35',
    marginRight: '8px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  nav: {
    marginTop: '48px',
    paddingTop: '24px',
    borderTop: '1px solid #2a2a2a',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  navBtn: {
    background: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#888',
    padding: '10px 18px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navBtnPrimary: {
    color: '#ff6b35',
    borderColor: '#ff6b35',
  },
  footer: {
    marginTop: '64px',
    paddingTop: '32px',
    borderTop: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  footerSig: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    color: '#888',
    lineHeight: 1.6,
  },
  footerNote: {
    color: '#555',
    fontSize: '11px',
  },
  footerCta: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  ctaLink: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    letterSpacing: '0.05em',
    color: '#f5f1eb',
    textDecoration: 'none',
    border: '1px solid #2a2a2a',
    padding: '10px 18px',
  },
};
