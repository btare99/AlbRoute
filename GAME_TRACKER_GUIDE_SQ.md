# 🎬 Movie Rating System - Udhëzuesi i Thjeshtë

## 📝 Përshkrimi

Një aplikacion **të thjeshtë dhe të fuqishëm** për vlerësimin dhe ndjekjen e filmave. Përdoruesit mund të:

✅ Shto filma, serial TV dhe dokumentarë  
✅ Vlerëso media me pikë 0-10  
✅ Shiko filmat më të vlerësuar  
✅ Merr statistika për media  
✅ Shiko vlerësimet e përdoruesve  
✅ Merr përmbledhje sipas zhanrit  
✅ Ruaj dhe ngarko të dhënat  

---

## 🎯 8 Konceptet e Avancuara të Python (Në Terma Të Thjeshtë)

### 1. **Custom Exceptions - "Mesazhe Gabimi të Personalizuara"**

```python
class MovieException(Exception): pass         # Gabim i përgjithshëm filmash
class InvalidRatingError(MovieException): pass # Vlerësimi nuk është i mirë
class MovieNotFoundError(MovieException): pass # Filmi nuk u gjet
```

**Në jetën e përditshme:** Nëse shkon në një dyqan të këpucëve dhe kërkosh ndonjë numër që nuk ekziston, dyqani nuk të thotë thjesht "gabim" - të thotë "Na bie në mend që ky numër nuk ka në stok". Kjo e bën të qartë problemin.

**Në kod:** Përdor saktësisht "nuk u gjet" në vend të "diçka u prish" - më e përshtatshme!

---

### 2. **Decorators - "Etiketa të Veçanta për Funksionet"**

#### `@timing_decorator` - Mat kohën
```python
@timing_decorator
def save_data(self):
    # Automatikisht i thotë: "Kjo përfundoi në 0.234 sekonda"
```

#### `@validate_rating` - Kontroller cilësie
```python
@validate_rating
def rate_media(self, title, user, rating):
    # Para se të ruaje: "A është vlerësimi 0-10? A është emri bosh?"
```

**Në jetën e përditshme:** Imagjino se në supermarket, para se të paguash, ka një punonjës që kontrollon:
- "A janë të paguara të gjithë artikujt?"
- "A është kasieri i saktë?"

Dekoratoren është si ky punonjës - përpara se të lejojë blerjen (funksionin), kontrollon gjithçka!

**Pse përdoret?** Para, do duhej të shkruaje kontrollim në çdo funksion. Dekoratoren e bën automatikisht!

---

### 3. **Abstract Classes - "Bluprinti i Përbashkët"**

```python
class Media(ABC):  # "Të gjitha mediat duhet të kenë këto"
    @abstractmethod
    def get_genre(self) -> str: pass      # Filmi ose Serial?
    
    @abstractmethod
    def get_rating_weight(self) -> float: pass  # Sa këpucë për vlerësimin?
```

**Zbatimet praktike:**
- `Movie` - Filma me peshë 1.0 (100%)
- `Series` - Serial TV me peshë 1.05 (105% - merr më shumë pikë)
- `Documentary` - Dokumentarë me peshë 0.95 (95% - merr pak më pak)

**Në jetën e përditshme:** Filmat dhe serialet janë të ndryshme, por të dyja kanë të njëjtat gjëra:
- Titull
- Vlerësim
- Përdorues që kanë vlerësuar

Por serialet kanë sezona, filmat kanë regjisor. Pra, kanë rregulla pak të ndryshme - por për në fund, bëjnë të njëjtën punë (vlerësohen)!

**Pse përdoret?** Nëse duhet të shtosh një tip të ri (shembull: animations), thjesht e kopjon structurën dhe zëvendesohet se si funksionon!

---

### 4. **Type Hints - "Etiketat me Përshkrimet e Tipeve"**

```python
def rate_media(self, media_title: str, user_name: str, rating: float) -> None:
#                                    ^^^              ^^^            ^^^^^
#                                    Tekst            Tekst          Numër me presje
```

**Në jetën e përditshme:** Imagjino se në një formuluar në spital:
```
Emri: _________________ (TEKST)
Mosha: ________________ (NUMËR)
Përshkrimi i problemit: _________________ (TEKST)
```

Kjo i thotë doktorit saktësisht çfarë të presë në secilin fushë.

**Në kod:** `str` = tekst, `int` = numër i plotë, `float` = numër me presje, `None` = nuk kthehet asgjë.

**Pse përdoret?** 
- Kur shkruajtje kodin, IDE të thotë se "këtu duhet tekst, jo numër"
- Nëse gabim, GitHub thote përpara se të shtypish enter!

---

### 5. **Regex - "Kontrollues i Modeleve"**

```python
pattern = r'^[a-zA-Z0-9\s\-\:\']{2,100}$'
# Thote: "Titullin mund të ketë shkronja, numra, hapesira, vizë"
# Por jo simbole si @ # $ % 

pattern = r'^(19|20)\d{2}$'
# Thote: "Viti duhet të fillojë me 19 ose 20, pastaj 2 numra"
# OK: 2010, 1995, 2024
# JO OK: 1850, 2099, 20
```

**Në jetën e përditshme:** Një doktor kontrollon shënimin e një telefoni:
- "Fillon me +355?"
- "Pastaj 10 numra pa hapesira?"

Nëse plotëson, OK. Nëse jo, të thotë "Format gabim!"

**Pse përdoret?** Nëse përdoruesja shtype diçka të çuditshme, thote menjëherë "Kjo nuk duket si vit!" në vend të përshtypjes më vonë!

---

### 6. **Collections - "Kutitë e Zgjuara për të Dhënat"**

#### defaultdict - Kutia e Sigurtë
```python
vleresimet = defaultdict(list)  # Nëse nuk ka çelës, krijo listë boshe
vleresimet["Alice"].append(9.5)
vleresimet["Alice"].append(8.0)
# OK! Nuk shkatërrohesh përse "Alice" nuk ekzistonte!
```

#### Counter - Numërues i Frekuencës
```python
from collections import Counter
zhanre = Counter(['MOVIE', 'MOVIE', 'SERIES', 'DOCUMENTARY', 'MOVIE'])
# Rezultat: MOVIE:3, SERIES:1, DOCUMENTARY:1

zhanre.most_common(2)  # Dy më të shumta: [('MOVIE', 3), ('SERIES', 1)]
```

**Në jetën e përditshme:** Në një dyqan:
- `defaultdict` = Nëse nuk ka produktin në katalog, krijo automatikisht një faqe
- `Counter` = "Cilat janë 3 produktet më të shitur këtë javë?"

**Pse përdoret?** Janë më të shpejta dhe më të sigurta se ta shkruaje vetë logjikën!

---

### 7. **Context Managers (Menaxherët e Kontekstit)**

```python
@contextmanager
def safe_file_operation(filename: str, mode: str = 'r'):
    file = None
    try:
        file = open(filename, mode)
        yield file
    finally:
        if file:
            file.close()
```

**Pye?** Garanton mbylljen e skedarit edhe nëse ndodh gabim.

---

### 8. **Lambda Functions & List Comprehensions**

```python
# List comprehension
ratings = [
    (title, media.get_average_rating())
    for title, media in self.media.items()
]

# Lambda sorting
sorted(ratings, key=lambda x: x[1], reverse=True)
```

**Pye?** Kod i pastër dhe Pythonic.

---

## 🚀 Si të Drejtohuni

```bash
python3 game_score_tracker.py
```

### Shembull i Përdorimit:

```
🎬 Welcome to Movie Rating System!

🎬 MOVIE RATING SYSTEM
==================================================
1. Add Media
2. Rate Media
3. View Top Rated
4. View Media Stats
5. View User Ratings
6. Genre Summary
7. List All Media
8. Save Data
9. Load Data
0. Exit
==================================================
Select option: 1

Media Types: movie, series, documentary
Type: movie
Title: Inception
Year (1900-2099): 2010
Director name: Christopher Nolan
✅ Added movie: Inception (2010)

Select option: 2
Media title: Inception
Your name: Alice
Rating (0-10): 9.5
✅ Alice rated Inception: 9.5/10

Select option: 3

⭐ Top Rated Media:
  1. Inception: 9.50/10

Select option: 0
👋 Goodbye!
```

---

## 📊 Tre Llojet e Media

### Movie (Filma)
```python
Movie("Inception", 2010, "Christopher Nolan")
# Pesha: 1.0 (normal)
```

### Series (Serial TV)
```python
Series("Breaking Bad", 2008, 5)
# Pesha: 1.05 (pak më e lartë - më shumë episodes)
```

### Documentary (Dokumentarë)
```python
Documentary("Planet Earth", 2006, "Biology")
# Pesha: 0.95 (pak më e ulët - niche content)
```

---

## 💡 Cilësite Unike

1. **Tri Lloje Media:**
   - Filma me regjisor
   - Serial TV me numrin e sezoneve
   - Dokumentarë me temë

2. **Pesha e Vlerësimit:**
   - Serial TV: +5% (më shumë orë përmbajtjeje)
   - Dokumentarë: -5% (më pak popullor)
   - Filma: 100% (baseline)

3. **Leaderboards:**
   - Filmat më të vlerësuar
   - Vlerësimet e përdoruesve

4. **Statistika:**
   - Best, worst, average rating
   - Numri i vlerësimeve
   - Përmbledhje sipas zhanrit

5. **Persistenca e të Dhënave:**
   - Ruaj në JSON
   - Ngarko kur të hapet përsëri

---

## 🎯 Pse Ky Është i Përshtatshëm

✅ **Jo shumë kompleks** - Vetëm 8 koncepte  
✅ **Funksional** - Përdoruesit mund të përdorin direkt  
✅ **Edukativisht i vlefshëm** - Demonstron konceptet qartë  
✅ **Ndryshe nga të tjerët** - Fokus në filma, jo lojëra apo detyra  
✅ **Interaktiv** - CLI me 9 opsione inputesh  

---

## 📋 Operacione Kryesore

| Operacion | Inputet | Dalja |
|-----------|---------|-------|
| Add Media | Lloji, Emri, Viti, Extra | Mesazh konfirmimi |
| Rate Media | Media, Përdorues, Vlerësim | Validim & Ruajtje |
| Top Rated | - | Filmat më të mirë |
| Media Stats | Emri media | Statistika të plota |
| User Ratings | Emri përdorues | Të gjitha vlerësimet e tyre |
| Genre Summary | - | Përmbledhje sipas zhanrit |
| Save Data | - | Ruaj në JSON |
| Load Data | - | Ngarko nga JSON |

---

## 🚀 Zgjerimi i Mundshëm

- Shto filtrim sipas viti produksioni
- Shto kërkim sipas emri aktori
- Vlerësim sipas kategorisë (traiç, veprim, etj)
- Historiku i ndryshjeve të vlerësimit
- Notë përvojë përdoruesi
- Eksporti në CSV

---

## ✨ Përfundim

Ky aplikacion të çon në **thellësinë e duhur** të koncepteve avancuara pa u mbipërplicuar. Është perfekt për demonstrim të:

- **Polimorfizmit** - Media të ndryshme, ndërfaqe e njëjtë
- **Dekoratorëve** - Validim + timing pa ndryshim logjike
- **Klasave Abstrakte** - Specifikimi i ndërfaqes për të gjithë media-t
- **Type Hints** - Kod i qartë dhe i sigurë
- **Collections** - Strukturat e duhura për të dhënat

**Është i thjeshtë për të mësuar, por mjaftueshëm i fuqishëm për të qenë i dobishëm!** 🎬✨
