# Site Claire Charpentier (version 2)

Site statique, sans installation. Pour le voir : ouvrir `index.html`, ou lancer `python3 -m http.server` dans ce dossier puis aller sur http://localhost:8000.

GSAP, ScrollTrigger et Lenis sont embarqués dans `assets/js/vendor/` (aucun CDN). Seules les polices (Google Fonts), la carte (Google Maps) et les photos temporaires viennent d'Internet.

## Images à remplacer
Les photos actuelles sont des images temporaires chargées depuis Unsplash, pour visualiser la maquette. Elles ne sont pas faites pour la mise en ligne.
Pour les remplacer : déposer les vraies photos dans `assets/img/` puis changer l'attribut `src` de chaque `<img>` dans `index.html`.
Si une image ne charge pas, l'emplacement affiche un fond coloré avec son intitulé (attribut `data-label`).
Les images en noir et blanc passent en couleur au survol : il suffit d'enlever la classe `bw` pour qu'une image reste en couleur.

| Emplacement | Format conseillé |
|---|---|
| Hero, grande arche (chien) | portrait 900 x 1200 |
| Hero, rond (chat) | carré 500 x 500 |
| Hero, 2 pastilles dans le titre | paysage 300 x 140 |
| Frise (6 images) | carré 400 x 400 et portrait 400 x 560 |
| Image plein écran « Les mains pour seul outil » | paysage 1800 x 1100 |
| Blocs : portrait de Claire | carré 900 x 900 |
| Blocs : rond chien et chat, photo chat | carré |
| Chien et chat (tarifs) | portrait 700 x 940 |
| La séance (4 images rondes) | carré 800 x 800 |
| Conseils (2 onglets) | portrait 600 x 800 |
| Portrait de Claire (section Claire) | portrait 800 x 1060 |
| La Grande Odyssée | paysage 900 x 700 |
| Image de partage (réseaux) | `assets/img/partage.jpg`, 1200 x 630 (à créer) |

## À valider avec Claire
- Tarif (70 € chien et chat), adresse du cabinet et lien de prise de rendez-vous : repris de son site actuel.
- Délai de rendez-vous d'environ six semaines : affiché dans la FAQ et le contact.
- Textes de la partie « Conseils aux maîtres » (signes repris de son site, conseils avant et après séance rédigés).
- SIRET et hébergeur dans `mentions-legales.html`.
- Nom de domaine : le site déclare `https://osteopathe-canin-equin-felin.fr/` (canonical, sitemap, robots, données structurées). À changer partout si le domaine change.
