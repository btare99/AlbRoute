const fs = require('fs');

const files = [
  "app/components/profile/EditProfileView.tsx",
  "app/components/profile/ProfileView.tsx",
  "app/components/map/MapView.tsx",
  "app/components/map/TripPlanner.tsx",
  "app/components/map/BusTracker.tsx",
  "app/components/layout/Sidebar.tsx",
  "app/components/subscription/SubscriptionView.tsx" // to fix line 65
];

let counter = 0;
let newTranslations = { al: {}, en: {}, it: {} };

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Regex for full triple: language === 'al' ? 'Al' : language === 'en' ? 'En' : 'It'
  const regex3 = /language\s*===\s*'al'\s*\?\s*(`[^`]*`|'[^']*'|"[^"]*")\s*:\s*language\s*===\s*'en'\s*\?\s*(`[^`]*`|'[^']*'|"[^"]*")\s*:\s*(`[^`]*`|'[^']*'|"[^"]*")/g;
  content = content.replace(regex3, (match, al, en, it) => {
    if(al.includes('${') || en.includes('${') || it.includes('${')) return match;
    const key = `auto_${file.split('/').pop().replace('.tsx', '').toLowerCase()}_${counter++}`;
    newTranslations.al[key] = al.slice(1, -1);
    newTranslations.en[key] = en.slice(1, -1);
    newTranslations.it[key] = it.slice(1, -1);
    return `t.${key}`;
  });

  // Regex for pair: language === 'al' ? 'Al' : 'En'
  const regex2 = /language\s*===\s*'al'\s*\?\s*(`[^`]*`|'[^']*'|"[^"]*")\s*:\s*(`[^`]*`|'[^']*'|"[^"]*")/g;
  content = content.replace(regex2, (match, al, en) => {
    if(al.includes('${') || en.includes('${')) return match;
    const key = `auto_${file.split('/').pop().replace('.tsx', '').toLowerCase()}_${counter++}`;
    newTranslations.al[key] = al.slice(1, -1);
    newTranslations.en[key] = en.slice(1, -1);
    newTranslations.it[key] = en.slice(1, -1);
    return `t.${key}`;
  });

  fs.writeFileSync(file, content);
});

// Update translations.ts
const transFile = 'app/store/translations.ts';
let transContent = fs.readFileSync(transFile, 'utf8');

function injectTranslations(lang, data, text) {
  let entries = Object.entries(data).map(([k, v]) => `    ${k}: "${v}",`).join('\n');
  const regex = new RegExp(`(${lang}:\\s*\\{[^}]*?)(\\n\\s*\\})`);
  return text.replace(regex, `$1\n${entries}$2`);
}

transContent = injectTranslations('al', newTranslations.al, transContent);
transContent = injectTranslations('en', newTranslations.en, transContent);
transContent = injectTranslations('it', newTranslations.it, transContent);

fs.writeFileSync(transFile, transContent);

console.log("Done extracting:", counter);
