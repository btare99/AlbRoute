from pathlib import Path
path = Path('app/components/subscription/SubscriptionCheckoutView.tsx')
lines = path.read_text(encoding='utf-8').splitlines()
for start,end in [(300,380),(380,460),(460,520),(520,600),(600,700),(700,760)]:
    print('---', start, end)
    for i in range(start, end+1):
        print(f'{i:4d}: {lines[i-1]}')
