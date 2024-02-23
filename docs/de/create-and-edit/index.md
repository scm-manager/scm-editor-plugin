---
title: Erstellen und bearbeiten
subtitle: Neue Textdatei erstellen bzw. Textdatei editieren
---
![Neue Textdatei erstellen](assets/fileEditor.png)

Zum Erstellen bzw. zum Ändern einer Textdatei wird ein Editor geöffnet. Der Editor unterstützt Syntax-Highlighting für alle gängigen Programmiersprachen und Dateiformate. 

Folgende Informationen bzw. Interaktionen bietet der Editor:

- **Ausgewählter Branch:** Die Datei wird mit einem neuen Commit auf diesem Branch erzeugt bzw. modifiziert.
- **Pfad:** Der Dateipfad, in dem die Datei angelegt wird (beim Bearbeiten einer vorhandenen Datei ist dieses Feld nicht änderbar).
- **Dateiname:** Der Name der Datei  (beim Bearbeiten einer vorhandenen Datei ist dieses Feld nicht änderbar).
- **Highlighting**: Auswahl der angezeigten Highlightings. Der Editor ermittelt, sofern verfügbar, eigenständig ein passendes Highlighting. Zusätzlich kann über das Dropdown die Auswahl geändert werden.
- **Inhalt:** Der Inhalt der neuen bzw. geänderten Datei.
- **Autor:** Dieser Benutzer wird als Autor in den neuen Commit geschrieben.
- **Commit Nachricht:** Die Nachricht für den neuen Commit.

### Editornavigation

| Key Combination | Description                                                         |
|-----------------|---------------------------------------------------------------------|
| ctrl enter      | (Im Editor) Verlasse den Editor und fokussiere die Commit Nachricht |
| ctrl enter      | (In der Commitnachricht) Schicke den Commit ab                      |
| Escape          | (In der Commitnachricht) Fokussiere den Cancel-Button               |


Immer wenn der Editor neu fokussiert wird, prüft der SCM-Manager, ob auf dem Branch bzw. dem Repository neue Revisionen
vorhanden sind. Wenn neue Revisionen vorhanden sind, wird eine Warnung angezeigt und die Änderungen können nicht mehr
mit einem Commit abgeschlossen werden. Werden neue Revisionen nicht rechtzeitig erkannt, wird ein Commit vom Server
abgelehnt und es wird eine Fehlermeldung bzgl. der parallelen Änderung angezeigt.
