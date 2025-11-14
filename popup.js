document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup geladen.');

  // ⬇️ eigene URLs eintragen
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHppkPF4VwGaZhQUcEONVpBYJv6w5yJiE8AjS_Dr0fRo746mdn_lI8SzvmFepAdkPnVw/exec';
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Cci9ueqCylcshzJ4LC4Ke-xeat7CW9x4GNFP2pcXVyo/edit';

  const saveButton = document.getElementById('saveButton');
  const openSheetButton = document.getElementById('openSheetButton');
  const statusDiv = document.getElementById('status');

  // Prüfen, ob Elemente existieren
  const missing = [];
  if (!saveButton) missing.push('saveButton');
  if (!openSheetButton) missing.push('openSheetButton');
  if (!statusDiv) missing.push('status');
  if (missing.length > 0) {
    console.error('❌ Folgende Popup-Elemente fehlen:', missing.join(', '));
    return;
  }

  // Tabelle öffnen
  openSheetButton.addEventListener('click', () => {
    chrome.tabs.create({ url: SHEET_URL });
  });

  // Buttontext automatisch anpassen
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0] || !tabs[0].url) return;
    const currentUrl = tabs[0].url;

    if (currentUrl.includes('linkedin.com/in/')) {
      saveButton.textContent = 'Profil speichern';
    } else if (currentUrl.includes('linkedin.com/company/')) {
      saveButton.textContent = 'Unternehmen speichern';
    } else if (currentUrl.includes('linkedin.com/school/')) {
      saveButton.textContent = 'Hochschule speichern';
    } else {
      saveButton.textContent = 'Seite speichern';
    }
  });

  // Speichern-Button klick
  saveButton.addEventListener('click', () => {
    statusDiv.textContent = 'Speichere...';
    saveButton.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) {
        statusDiv.textContent = 'Kein aktiver Tab gefunden.';
        saveButton.disabled = false;
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const url = window.location.href;
            let type = '';
            let firstName = '', lastName = '', position = '', company = '';

            // Profilseite
            if (url.includes('linkedin.com/in/')) {
              type = 'Profil';
              const nameEl =
                document.querySelector('h1.text-heading-xlarge') ||
                document.querySelector('.pv-text-details__left-panel h1') ||
                document.querySelector('h1');
              const fullName = nameEl?.innerText?.trim() || '';
              const parts = fullName.split(' ');
              firstName = parts[0] || '';
              lastName = parts.slice(1).join(' ') || '';

              position =
                document.querySelector('.text-body-medium.break-words')?.innerText?.trim() ||
                document.querySelector('.pv-text-details__left-panel div.text-body-medium')?.innerText?.trim() ||
                '';

              const companyEl =
                document.querySelector('a[data-field="experience_company_link"]') ||
                document.querySelector('.pv-text-details__right-panel a') ||
                document.querySelector('.pv-entity__secondary-title');
              company = companyEl?.innerText?.trim() || '';

              if (!company && position.includes('bei ')) {
                company = position.split('bei ')[1]?.trim() || '';
              } else if (!company && position.includes('at ')) {
                company = position.split('at ')[1]?.trim() || '';
              }
            }

            // Unternehmensseite
            else if (url.includes('linkedin.com/company/')) {
              type = 'Unternehmen';
              const nameEl =
                document.querySelector('h1') ||
                document.querySelector('.org-top-card-summary__title') ||
                document.querySelector('.top-card-layout__title');
              company = nameEl?.innerText?.trim() || '';
            }

            // Hochschulseite
            else if (url.includes('linkedin.com/school/')) {
              type = 'Hochschule';
              const nameEl =
                document.querySelector('h1') ||
                document.querySelector('.org-top-card-summary__title') ||
                document.querySelector('.top-card-layout__title');
              company = nameEl?.innerText?.trim() || '';
            }

            return { url, type, firstName, lastName, position, company };
          },
        },
        (injectionResults) => {
          if (!injectionResults || !injectionResults[0]) {
            statusDiv.textContent = 'Keine Daten gefunden.';
            saveButton.disabled = false;
            return;
          }

          const result = injectionResults[0].result;
          if (!result || !result.type) {
            statusDiv.textContent = 'Kein gültiges Profil erkannt.';
            saveButton.disabled = false;
            return;
          }

          // Daten an Google Script senden (robuste Variante)
          fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              url: result.url,
              type: result.type,
              firstName: result.firstName,
              lastName: result.lastName,
              position: result.position,
              company: result.company,
            }),
          })
            .then(async (response) => {
              const text = await response.text();
              try {
                const data = JSON.parse(text);
                if (data.status === 'success') {
                  statusDiv.textContent = `✅ ${result.type} gespeichert → Tabellenblatt: ${data.sheet}`;
                  saveButton.textContent = 'Gespeichert!';
                  saveButton.style.backgroundColor = '#4CAF50';
                  setTimeout(() => {
                    saveButton.textContent = 'Speichern';
                    saveButton.style.backgroundColor = '#0073b1';
                  }, 1500);
                } else {
                  statusDiv.textContent = 'Server-Fehler: ' + (data.message || 'Unbekannt');
                }
              } catch {
                console.warn('⚠️ Antwort war kein JSON:', text.slice(0, 200));
                statusDiv.textContent = 'Google Script hat keine gültige JSON-Antwort geliefert.';
              }
            })
            .catch((error) => {
              console.error('Fetch Error:', error);
              statusDiv.textContent = 'Senden fehlgeschlagen.';
            })
            .finally(() => {
              saveButton.disabled = false;
            });
        }
      );
    });
  });
});
