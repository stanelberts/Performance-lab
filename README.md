
# Stan's Performance Lab 🦾

Een geavanceerde sport-analyse tool voor Strava data, met focus op progressie per label, Hyrox tracking en krachtstatistieken.

## Run Locally

### Prerequisites
*   [Node.js](https://nodejs.org/) geïnstalleerd op je computer.

### Installatie & Opstarten

1.  **Dependencies installeren**:
    Open je terminal in de projectmap en voer uit:
    ```bash
    npm install
    ```

2.  **API Key instellen**:
    Maak een nieuw bestand aan genaamd `.env.local` in de hoofdmap van het project en voeg je Gemini API key toe:
    ```env
    API_KEY=jouw_eigen_gemini_api_key
    ```
    *(Je kunt een gratis sleutel krijgen via [Google AI Studio](https://aistudio.google.com/))*

3.  **App starten**:
    Start de lokale ontwikkelomgeving:
    ```bash
    npm run dev
    ```

4.  **Openen**:
    Ga in je browser naar de URL die in de terminal verschijnt (meestal `http://localhost:5173`).

## Functionaliteiten
- **Strava Sync**: Koppel je account en haal automatisch je sessies op.
- **AI Performance Coach**: Krijg diepe analyses van je workouts via Google Gemini.
- **Hyrox Tracking**: Specifieke logs voor alle 8 Hyrox stations en races.
- **Progressie Analyse**: Visualiseer je tempo en efficiëntie over tijd per label.
