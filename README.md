# 🏎️ F1 Fan Arena

Eine Formel-1-Fan-App mit fünf Spielen, gebaut mit Vanilla JavaScript (ES-Module), ohne Build-Schritt und ohne Abhängigkeiten.

## Spiele

| Spiel | Worum geht's? |
| --- | --- |
| 🙈 **Blind Ranking** | Fünf Fahrer, Strecken oder Teams erscheinen nacheinander. Jeder muss sofort auf Platz 1–5 gesetzt werden, ohne zu wissen, was noch kommt. Objektive Kategorien (Siege, Poles, Podien, Debüt, Streckenlänge, Konstrukteurstitel) werden ausgewertet, persönliche Rankings (GOAT, Lieblingsstrecken) lassen sich kopieren und teilen. |
| ↕️ **Higher or Lower** | Hat der nächste Fahrer mehr oder weniger Siege, Poles oder Podien? Ist die Strecke länger oder kürzer? Ziel ist die längste Serie. Steuerung auch mit ↑ / ↓. |
| ⏳ **Time Machine** | Ein legendärer F1-Moment wird gezeigt, du schätzt das Jahr. Ein Volltreffer bringt 100 Punkte, danach gibt es 10 Punkte Abzug pro Jahr Abweichung. |
| 🕵️ **Wer bin ich?** | Errate den Fahrer anhand von bis zu fünf Hinweisen. Je weniger Hinweise du brauchst, desto mehr Punkte. |
| 👑 **Weltmeister-Quiz** | Ein Jahr und vier Fahrer: Wer wurde Weltmeister? Die falschen Antworten stammen aus derselben Ära. |

Rekorde werden im `localStorage` des Browsers gespeichert.

## Starten

ES-Module brauchen einen lokalen Webserver (das direkte Öffnen per `file://` funktioniert nicht):

```bash
npm start            # = python3 -m http.server 8080
# alternativ: npx serve .
```

Danach im Browser http://localhost:8080 öffnen. Die App läuft auch direkt auf GitHub Pages.

## Tests

```bash
npm test
```

Die Tests prüfen die Spiellogik (Punktevergabe, Namenserkennung, Quiz-Antworten) und die Konsistenz der Daten, z. B. ob die WM-Titel der Fahrer zur Weltmeisterliste passen.

## Daten

Alle Daten liegen in `js/data.js` (Stand: Ende der Saison 2024, ohne Gewähr). Neue Fahrer, Strecken oder Time-Machine-Ereignisse lassen sich dort einfach ergänzen.

## Struktur

```
index.html
css/style.css
js/app.js          Startseite und Routing (#/spiel-id)
js/data.js         Fahrer, Strecken, Teams, Weltmeister, Ereignisse
js/utils.js        Hilfsfunktionen (Zufall, Punkte, Speicher, DOM)
js/ui.js           Gemeinsame UI-Bausteine
js/games/*.js      Die einzelnen Spiele
tests/             node:test-Tests
```

*Inoffizielles Fanprojekt, nicht mit der Formel 1, der FIA oder den Teams verbunden.*
