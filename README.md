# BARWORK – Calisthenics Trainingspläne (Web-App)

Statische Web-App (PWA), fertig für GitHub Pages. Enthält 3 vorinstallierte Madbarz-Pläne,
geführtes Training mit Timer/Runden/Pausen, eigenen Plan-Editor, Verlauf, Einstellungen,
Offline-Betrieb und Installation auf dem Home-Bildschirm.

## Auf GitHub Pages veröffentlichen
1. Neues Repository auf GitHub anlegen (z. B. `barwork`).
2. **Alle Dateien aus diesem Ordner** ins Repo-Root hochladen (index.html muss oben liegen).
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch `main`, Ordner `/ (root)` → Save.
4. Nach ~1 Min ist die App unter `https://DEIN-NAME.github.io/barwork/` erreichbar.

## Auf dem Handy installieren
- **Android/Chrome:** Menü → „App installieren“ (oder Banner in der App).
- **iPhone/Safari:** Teilen-Symbol → „Zum Home-Bildschirm“.

Alle Daten (eigene Pläne, Verlauf) bleiben lokal auf dem Gerät.


### Firebase Login & Fortschrittsspeicherung
Diese Version enthält Firebase Authentication mit E-Mail/Passwort sowie Firestore-Sync pro Benutzerkonto.

Vor dem produktiven Einsatz bitte in Firebase kontrollieren:
- Authentication → Sign-in method → E-Mail/Passwort aktivieren.
- Firestore Database anlegen.
- Firestore Rules für die App setzen, z. B. nur Zugriff auf die eigenen User-Daten zulassen:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/barwork/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Die App kann weiterhin ohne Login lokal genutzt werden. Beim Login werden lokale Daten mit Cloud-Daten zusammengeführt.
