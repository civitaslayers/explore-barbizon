# Research sweep, 2026-10-16, pass 2 (S2, task 7820f08f)

Branch `night/2026-10-16-research-sweep-2`. Pass 1 tonight (PR #52) covered
Les Charmettes, Maison Diaz, Occupation, TSM, Marie Bodmer, Trotsky, Renault,
Freyssinet, Apremont, Hôtel de la Forêt, Villa Bernard, Tumble Inn, Bas-Bréau,
Villa Élisabeth, Jacque, Ermitage, Berthelot, Farman, Landerer, Daubigny,
La Poste; none of those are redone here. William Morris Hunt rows were left to
job 2f8efdc5.

Reachable tonight: Wikipedia, museum collection pages, WebSearch snippets,
PDF press kits. Blocked (one attempt each, not retried): en.wikipedia article
« The Bodmer Oak » (provenance prompt), plus the known list (Tavily, archive.org
full text, HathiTrust, Gallica, POP, Commons, Persée).

Quotes everywhere are under 15 words. Proposals for published text are
proposals only; nothing in `locations` was touched.

## Karl Bodmer / Chêne Bodmer

Rows: 6 Karl Bodmer (lead/open), 2 Chêne Bodmer (open).

Checked: NGA Washington object page for the Bodmer lithograph « Intérieur de
Forêt » (acc. 1975.34.27, Ailsa Mellon Bruce Fund); Fontainebleau-tourisme
« circuit des peintres » leaflet (2022 PDF); franco.wiki mirror of the fr
Wikipedia article on Monet's « Un chêne au Bas-Bréau, le Bodmer » (Met 64.210).

Outcome: the NGA sheet's description shows a hunter with a dog, so it is
probably not the Bertauts deer plate after the Salon painting. The tourist
leaflet lists « Intérieur de forêt en hiver » as artwork 1 on the circuit,
so the title is in current local signage. Nothing new on the painting's
present holding nor on when the oak fell. The four Bodmer rows that depend
on AD77 deeds, the Forney scan or the 1906 census are archival and cannot
move from a web session; left untouched.

Change: note appended to row 0abee91a (Chêne Bodmer painting), with a
`[needs-local: POP Joconde]` tag. No change to published text proposed.

## Manoir Saint-Hérem (ex Hôtel Bellevue)

Rows: 8 (open/lead), all on the Picasso sentence from the mairie circuit.

Checked: Musée national Picasso-Paris press kit « Olga Picasso » (PDF, pp. 3,
6, 12). Searched « Picasso Barbizon Bellevue Olga pension »: only the 2023
Barbizon homage exhibition and the MoMA « Picasso in Fontainebleau » audio
page (known 403) come back.

Outcome: the museum's chronology reads « Été 1921 : Séjour à Fontainebleau. »
and never names Barbizon. Row 0a87a260 moved to `confirmed` on that source
(the Fontainebleau half of the claim). The Barbizon/Bellevue claim remains
supported only by the mairie circuit; nothing independent was found.

Proposal for published text (manoir-saint-herem, published, mentions
Picasso): keep as is pending task 44fc7fb6 (« Review Picasso claim »), which
already exists; no new task filed. Suggest the FR/EN text attribute the
claim explicitly (« selon le parcours de mémoire de la commune »).

## André Rouveyre

Rows: 11 (lead). All rest on Google Books snippets of the Gide and Brandes
correspondence, Billy, Champigneulle and Coquio, plus the death-place question.

Checked: en.wikipedia « André Rouveyre » (dates only, no places, no
footnotes); searches « data.bnf.fr Rouveyre » and « Rouveyre mort à
Barbizon 1962 » (NLI authority and museum-digital again, both already
logged); catalogue.bnf.fr notice cb39769795p (server error, not retried).

Outcome: no source reached tonight states Barbizon as place of death and no
new period text was found. Rows unchanged. Still needed: BnF authority
notice or the Barbizon 1962 death register, and the Gide-Rouveyre edition
in hand for the Charmettes letterheads.

## L'Ombrage (18 Grande Rue)

Rows: 5 (open/lead) on Maximilienne Whettnall, Rubinstein and Samson
François.

Checked: web search « Whettnall pianiste Maximilienne conservatoire premier
prix »: nothing beyond the musiciens77 blog already logged.

Outcome: no independent trace of the pianist; rows unchanged. A Conservatoire
prize list (Gallica, Le Ménestrel) remains the only likely anchor.
`[needs-local: Gallica « Whettnall » Ménestrel OR Conservatoire]` already
implied by row e2f5ceed.

## Coz Ker (34 Grande Rue)

Rows: 6 (open/lead): Eiffel, François Millet, Villa Marguerite / Duhamel.

Checked: web search « Gustave Eiffel Barbizon Grande Rue Coz Ker »: only
Breton villas and estate listings.

Outcome: the Eiffel claim still rests on the mairie circuit alone; the Duhamel
/ Villa Marguerite identification still needs the Karampournis book in hand.
Rows unchanged. No new proposal; the published text already follows the
mairie map by policy.

## Auberge Diaz (11 Grande Rue)

Rows: 6 (lead): 1948-62 press, Triolet, La Dague, 5 vs 11 numbering.

Checked: lesrestos.com and yonder.fr pages on La Folie Barbizon (May 2025
reopening, Lionel Bensemoun, « ancienne maison de campagne », address 5
Grande Rue). Neither gives the building's earlier names.

Outcome: nothing links La Folie's own communication to the Dague or the
Auberge Diaz; the lineage still rests on the booklet plus the directory
address match. Rows unchanged. No proposal.

## Auberge Ganne

Rows: 11 (open/lead), mostly on the opening date and the Luniot years.

Checked: Muséofile notice M0370 on POP (reachable tonight) and the
monumentum.fr mirror of Mérimée PA00086807; fontainebleau-tourisme leaflets.

Outcome: the Mérimée inscription (28 Dec 1984, façades, roofs, three
ground-floor rooms, cad. AI 434) was already `confirmed` on rows c8ac5ae7 and
fc89ac37. New from M0370: flats from the 1870s, Pierre-Léon Gauthier in the
1930s (house, three rooms open to the public), commune purchase 1987,
paintings and graffiti found in the early 1990s, museum 1995, Conseil
général 2004. Inserted one row (lead, uncited museum historique) and noted
on row da4d1b85 that the 1987 building purchase and the 1990 panel purchase
are distinct acts, so the 1985/1990 tension concerns the objects only. The
opening date (1824 business vs 1834 house) stays as pass 4 left it.

Proposal: the published Auberge Ganne text could add the 1987 purchase and
1995 opening with « selon le Répertoire des musées de France » if Luigi
accepts Muséofile as a citeable source; otherwise no change.

## Ziem plaque (56 bis Grande Rue)

Rows: 3 (open/lead). Checked: en.wikipedia « Félix Ziem » (no Barbizon
house, no Jacque); franco.wiki mirror of fr.wikipedia (client error); search
« Ziem Barbizon 1866 Jacque musée Ziem Martigues » returns only the Petit
Palais kit already logged. Outcome: nothing beyond the 2013 Petit Palais
statement (one house, Jacque's, 1866). Rows unchanged; the plaque photo
(row 79aeed57) remains a human action.

## Villa des Artistes (12 Grande Rue) and Les Bosquets (2 Grande Rue)

Rows: 3 + 3. All open points are the street number (12), the Grigorescu
lodging and the no. 2 / no. 6 question, which need the cadastre, the owner
or plaque photos. No web source can settle them; not searched further
tonight. Rows unchanged.

## Atelier Daubigny plaque

Rows: 3 (open/lead): façade orientation (on-site), two copies of the circuit
text on « Mme Baratin ». Nothing to gain from the web; rows unchanged.

## Chapelle de Barbizon

Rows: 3 (lead): Fageon / Séroin roles, 24 Jan 1889 vs the map's 1904.
Pass 5 yesterday already found the two institutional sources for the barn
and 1889; the role question needs the January 1889 diocesan or local press
(Gallica, blocked). Rows unchanged. The proposal from pass 5 stands: the
published narrative should not name who blessed the chapel until a period
source is read. `[needs-local: Gallica « Barbizon » chapelle janvier 1889]`
is already implied by row cbfb978f.

## Mounet-Sully

Row: 1 (lead, Penesco snippet, Comédie-Française register). No reachable
source adds to it; unchanged.

## Roger Martin du Gard

Rows: 3 (lead). Checked: searches « Martin du Gard Charmettes Barbizon 1908
Devenir » and « hôtel des Charmettes » (Google Books result pages): only
Universalis, Larousse, Wikipedia and shop pages, none naming the hotel.
Outcome: « Hôtel des Charmettes » still rests on Sicard alone; rows
unchanged. The Correspondance générale vol. 1 (Gallimard 1980) remains the
place to look.
