# Claude Decision Tree

Arbre de décision interactif pour choisir le bon outil Claude.

## Déployer sur Vercel (5 minutes, sans installation locale)

### Méthode 1 — Drag & drop (la plus simple)

1. Va sur https://vercel.com/signup et crée un compte (gratuit, avec email ou GitHub)
2. Une fois connecté, clique sur **Add New → Project**
3. Cherche le bouton **Import Third-Party Git Repository** ou descends jusqu'à **Deploy a project without Git**
4. Si tu vois l'option **Import directly**, glisse simplement le dossier ZIP de ce projet
5. Vercel détecte automatiquement Vite. Laisse les paramètres par défaut.
6. Clique sur **Deploy**
7. Attends 30-60 secondes. Tu obtiens une URL du type `claude-decision-tree-xxx.vercel.app`

### Méthode 2 — Via GitHub (recommandée si tu veux pouvoir mettre à jour)

1. Crée un compte GitHub gratuit si tu n'en as pas
2. Crée un nouveau repository (par exemple `claude-decision-tree`)
3. Upload tous les fichiers de ce dossier dedans (bouton "uploading an existing file")
4. Sur Vercel, **Add New → Project → Import** ton repo
5. Deploy

### Personnaliser l'URL (sous-domaine vercel.app)

1. Sur le dashboard Vercel, ouvre ton projet
2. **Settings → Domains**
3. Tu peux changer le sous-domaine pour quelque chose comme `yann-lesueur.vercel.app` ou `claude-tools.vercel.app` (sous réserve de disponibilité)

### Domaine custom (optionnel, payant ~10€/an)

Si tu veux un vrai domaine type `yann-lesueur.fr` :
1. Achète le domaine sur Namecheap ou OVH
2. Dans Vercel **Settings → Domains**, ajoute ton domaine
3. Vercel te donne les DNS à configurer chez ton registrar

## Structure du projet

```
claude-decision-tree/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    └── ClaudeDecisionTree.jsx   ← le composant à modifier
```

Pour changer le contenu de l'arbre, édite `src/ClaudeDecisionTree.jsx`.
