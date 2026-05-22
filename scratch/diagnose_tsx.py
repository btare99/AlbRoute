from pathlib import Path
import re

path = Path('app/components/subscription/SubscriptionCheckoutView.tsx')
text = path.read_text(encoding='utf-8')
lines = text.splitlines()

# Simple bracket balance check for parentheses, braces, brackets.
for name, open_char, close_char in [('paren','(',')'),('brace','{','}'),('bracket','[',']')]:
    balance = 0
    for i, line in enumerate(lines, start=1):
        for ch in line:
            if ch == open_char: balance += 1
            elif ch == close_char: balance -= 1
        if balance < 0:
            print(f'Negative {name} balance at line {i}')
            break
    print(f'{name} balance final: {balance}')

# Simple JSX tag balance for div, button, form, style, fragment
tag_pattern = re.compile(r'<(/?)([A-Za-z][A-Za-z0-9]*)[^>]*?(/?)>')
stack = []
for i, line in enumerate(lines, start=1):
    for m in tag_pattern.finditer(line):
        closing, tag, selfclose = m.group(1), m.group(2), m.group(3)
        if tag.lower() in ['input','img','br','hr','video','path','area','meta','link','source','rect','line','circle','polyline','polygon','use','stop','ellipse','iframe','svg']:
            continue
        if tag == '' or tag == '>' or tag == '!' or tag == '?':
            continue
        if closing:
            if stack and stack[-1] == tag:
                stack.pop()
            else:
                print(f'unmatched close </{tag}> at line {i}')
        elif selfclose:
            continue
        else:
            stack.append(tag)
print('JSX stack top 10:', stack[-10:])

# print relevant lines around reported diag line numbers
for line_num in [201, 742, 903, 938, 1038, 1039]:
    print(f'--- line {line_num}: {lines[line_num-1]!r}')
    start = max(1, line_num-3)
    end = min(len(lines), line_num+3)
    for i in range(start, end+1):
        print(f'{i:4d}: {lines[i-1]}')
