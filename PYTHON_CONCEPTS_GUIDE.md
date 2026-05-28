# 📋 Dokumentacion — Task Manager (Python)

Ky skedar shpjegon çdo pjesë të kodit të `Task Manager`, duke përfshirë klasat, metodat, funksionet dhe logjikën e kushteve.

---

## 📦 Importet

```python
import json
import os
from datetime import datetime
```

| Librari | Qëllimi |
|---|---|
| `json` | Lexon dhe shkruan të dhëna në format JSON (skedar) |
| `os` | Kontrollon nëse një skedar ekziston në sistem |
| `datetime` | Merr datën dhe orën aktuale kur krijohet një detyrë |

---

## 🔷 Klasa `Task`

```python
class Task:
```

Përfaqëson **një detyrë të vetme**. Çdo detyrë ka titull, përshkrim, status dhe datën e krijimit.

### `__init__(self, title, description="", status="Pending")`

Konstruktori — thirret automatikisht kur krijohet një objekt `Task`.

| Parametri | Vlera default | Përshkrimi |
|---|---|---|
| `title` | *(i detyrueshëm)* | Titulli i detyrës |
| `description` | `""` (bosh) | Përshkrim opsional |
| `status` | `"Pending"` | Statusi fillestar |

```python
self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
```
Ruan datën dhe orën aktuale si tekst, p.sh. `"2026-05-28 14:30:00"`.

---

### `to_dict(self)`

```python
def to_dict(self):
    return {
        "title": self.title,
        "description": self.description,
        "status": self.status,
        "created_at": self.created_at
    }
```

Konverton objektin `Task` në një **fjalor (dictionary)** Python, i cili më pas mund të shkruhet si JSON në skedar. Kjo është e nevojshme sepse JSON nuk mund të ruajë objekte Python direkt.

---

## 🔷 Klasa `TaskManager`

```python
class TaskManager:
```

Menaxhon **koleksionin e të gjitha detyrave** dhe komunikon me skedarin JSON për ruajtje të përhershme.

---

### `__init__(self, filename="tasks.json")`

Konstruktori i `TaskManager`.

- Përcakton emrin e skedarit ku ruhen detyrat (`tasks.json` si parazgjedhje).
- Inicializon listën boshe `self.tasks = []`.
- Thërret `self.load_tasks()` menjëherë për të ngarkuar detyrat ekzistuese nga skedari.

---

### `load_tasks(self)`

```python
def load_tasks(self):
```

Ngarkon detyrat nga skedari JSON.

**Logjika:**

```python
if os.path.exists(self.filename):
```
- **`if`** — Kontrollon nëse skedari `tasks.json` ekziston.
  - **Po ekziston →** Hap skedarin, lexon të dhënat JSON dhe krijon objekte `Task` për secilën.
  - **Nuk ekziston →** Kalon te blloku `except` dhe fillon me listë boshe.

```python
except (json.JSONDecodeError, FileNotFoundError) as e:
```
- Kap gabimet: skedar i dëmtuar (JSON i pavlefshëm) ose skedar i pagjendur. Në këtë rast, fillon me lista boshe pa prishur programin.

---

### `save_tasks(self)`

```python
def save_tasks(self):
```

Ruan të gjitha detyrat aktuale në skedarin JSON.

```python
task_list = [task.to_dict() for task in self.tasks]
json.dump(task_list, f, indent=2)
```

- Përdor **list comprehension** për të kthyer çdo `Task` objekt në fjalor.
- `json.dump(...)` shkruan listën si JSON të formatuar (me `indent=2` për lexueshmëri).

```python
except IOError as e:
```
- Nëse shkruarja dështon (p.sh. problem me disk), shfaq mesazhin e gabimit pa prishur programin.

---

### `add_task(self, title, description="")`

```python
def add_task(self, title, description=""):
```

Shton një detyrë të re.

```python
if title.strip():
```
- **`if`** — Kontrollon që titulli nuk është bosh (pas heqjes së hapësirave).
  - **Titull i vlefshëm →** Krijon një `Task` të ri dhe e shton në `self.tasks`, pastaj ruan.
  - **Titull bosh →** Shfaq gabimin `"✗ Task title cannot be empty!"` dhe nuk shton gjë.

---

### `complete_task(self, index)`

```python
def complete_task(self, index):
```

Shënon një detyrë si të përfunduar sipas indeksit të saj.

```python
if 0 <= index < len(self.tasks):
```
- **`if`** — Kontrollon që indeksi është i vlefshëm (brenda kufijve të listës).
  - **I vlefshëm →** Ndryshon `status` e detyrës në `"Completed"` dhe ruan.
  - **I pavlefshëm →** Shfaq `"✗ Invalid task index!"`.

```python
except IndexError:
```
- Mbrojtje shtesë nëse ndodh ndonjë gabim i papritur me indeksin.

---

### `remove_task(self, index)`

```python
def remove_task(self, index):
```

Fshin një detyrë sipas indeksit.

```python
if 0 <= index < len(self.tasks):
```
- **`if`** — E njëjta logjikë kontrolli si te `complete_task`.
  - **I vlefshëm →** `self.tasks.pop(index)` heq detyrën nga lista dhe ruan ndryshimet.
  - **I pavlefshëm →** Shfaq gabimin.

```python
except IndexError:
```
- Kap gabimin nëse indeksi është jashtë listës.

---

### `view_tasks(self)`

```python
def view_tasks(self):
```

Shfaq të gjitha detyrat në format tabele.

```python
if not self.tasks:
```
- **`if`** — Nëse lista e detyrave është boshe, shfaq mesazhin `"📋 No tasks yet!"` dhe del nga funksioni me `return`.

```python
status_symbol = "✓" if task.status == "Completed" else "○"
```
- **Shprehje kushtëzuese (ternary)** — Nëse statusi është `"Completed"` vendos simbolin `✓`, përndryshe `○`.

Pastaj printon çdo detyrë si rresht i formatuar me numrin, titullin, statusin dhe datën.

---

## 🔷 Funksioni `main()`

```python
def main():
```

Funksioni kryesor që drejton të gjithë programin. Krijon një `TaskManager` dhe hyn në një **loop të pafundmë** që shfaq menunë.

### Struktura `while True`

```python
while True:
```
Programi vazhdon të ekzekutohet derisa përdoruesi zgjedh opsionin `5` (Exit).

---

### Blloku `if/elif/else` i menusë

| Zgjedhja | Veprimi |
|---|---|
| `"1"` | Thërret `manager.view_tasks()` — shfaq të gjitha detyrat |
| `"2"` | Kërkon titull dhe përshkrim, thërret `manager.add_task(...)` |
| `"3"` | Shfaq detyrat, kërkon numër, thërret `manager.complete_task(index)` |
| `"4"` | Shfaq detyrat, kërkon numër, thërret `manager.remove_task(index)` |
| `"5"` | Shfaq mesazhin lamtumirës dhe `break` — del nga loop-i |
| `else` | Çdo hyrje tjetër → `"✗ Invalid choice!"` |

### Trajtimi i `ValueError`

```python
except ValueError:
    print("✗ Please enter a valid number!")
```

Për zgjedhjet `3` dhe `4`, nëse përdoruesi shkruan diçka që nuk është numër (p.sh. `"abc"`), `int(input(...))` hedh `ValueError`. Blloku `except` e kap dhe shfaq mesazhin e gabimit.

---

### `if __name__ == "__main__"`

```python
if __name__ == "__main__":
    main()
```

- Ky kushtëzim siguron që `main()` të ekzekutohet **vetëm kur skedari drejtohet direkt** (p.sh. `python task_manager.py`).
- Nëse skedari importohet nga një modul tjetër, `main()` **nuk** thirret automatikisht.

---

## 🗂️ Fluksi i Programit (Përmbledhje)

```
Programi fillon
      │
      ▼
TaskManager() krijohet → load_tasks() ngarkon skedarin
      │
      ▼
   MENU shfaqet
      │
   ┌──┴──────────────────────┐
   │  Zgjedhja e përdoruesit │
   └──┬──────────────────────┘
      │
   1 ─┤─▶ view_tasks()
   2 ─┤─▶ add_task() ──▶ save_tasks()
   3 ─┤─▶ complete_task() ──▶ save_tasks()
   4 ─┤─▶ remove_task() ──▶ save_tasks()
   5 ─┘─▶ EXIT (break)
```

---

*Dokumentacion i gjeneruar për kodin `task_manager.py`*