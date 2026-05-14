const fs = require('fs');

const files = [
  "app/components/profile/EditProfileView.tsx",
  "app/components/profile/ProfileView.tsx",
  "app/components/map/MapView.tsx",
  "app/components/map/TripPlanner.tsx",
  "app/components/map/BusTracker.tsx",
  "app/components/layout/Sidebar.tsx",
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('t.auto_') && !content.includes('const t = translations[')) {
    // 1. Inject import
    if (!content.includes('import { translations }')) {
      content = content.replace(/import useStore[^;]+;/, match => match + "\nimport { translations } from '../../store/translations';");
      changed = true;
    }
    
    // 2. Inject const t
    content = content.replace(/const language = useStore\(\(s(?:: any)?\) => s\.language\);/, match => match + "\n  const t = translations[language as keyof typeof translations] || translations.al;");
    changed = true;
  }

  if (changed) fs.writeFileSync(file, content);
});

console.log("Injected imports.");
