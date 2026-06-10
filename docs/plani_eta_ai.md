# Plani i Zbatimit: ETA me Inteligjencë Artificiale (Machine Learning)

Ky plan detajon hapat e nevojshëm për të kthyer llogaritjen e kohës së mbërritjes (ETA) të urbanëve nga formula e thjeshtë fizike (Distancë / Shpejtësi) në një model të saktë parashikues bazuar në Inteligjencë Artificiale.

## Përmbledhje e Teknologjisë

Në vend të pjesëtimit të distancës me shpejtësinë, ne do të ndërtojmë një model regresioni (p.sh. **XGBoost** ose **Random Forest** në Python). Ky model do të mësojë kohëzgjatjen historike të udhëtimit për çdo segment rrugor midis stacioneve, duke marrë parasysh ditën e javës, orën e pikut dhe vonesat e fundit. Modeli do të eksportohet si skedar **ONNX** dhe do të ekzekutohet direkt në backend-in tonë Next.js për të siguruar performancë maksimale pa vonesa rrjeti.

---

## Fazat e Zbatimit

### Faza 1: Grumbullimi i të Dhënave Historike (Data Collection)

Për të trajnuar një model inteligjent, na duhen të dhëna historike. SinoTrack dërgon koordinatat çdo 5 sekonda, të cilat duhet t'i ruajmë në mënyrë të strukturuar.

#### Skripti i Ri: [history-logger.js](file:///Users/loredanavasej/AlbRoute/scripts/history-logger.js)
* Krijohet një skript/funksion që dëgjon koordinatat nga marrësi TCP dhe i ruan në një koleksion të ri në Firestore të quajtur `gps_logs_historical`.
* **Struktura e dokumentit**:
  ```json
  {
    "busId": "9170258631",
    "routeId": "L1A",
    "lat": 41.3238,
    "lng": 19.7966,
    "speed": 22,
    "timestamp": "2026-06-10T20:45:00Z",
    "dayOfWeek": 3,
    "hourOfDay": 20
  }
  ```
* *Sugjerim*: Rekomandohet të lihen të dhënat të grumbullohen për të paktën 2-4 javë për të pasur të dhëna të mjaftueshme për stërvitjen e parë të modelit.

---

### Faza 2: Përgatitja e të Dhënave (Feature Engineering)

Pasi grumbullohen log-et, ato duhen shndërruar në një format që modeli i ML mund ta kuptojë.

* Rrugët e urbanëve ndahen në **segmente të mirëpërcaktuara** midis stacioneve (p.sh. Segmenti 1: *allias -> kopshti_27*, Segmenti 2: *kopshti_27 -> parafabrikatet*).
* Përpunohen log-et historike për të llogaritur kohën e saktë në sekonda që çdo urban ka shpenzuar për të përshkuar secilin segment.
* Gjenerohet një skedar dataset `training_data.csv` me kolonat:
  * `segment_id` (numër unik i segmentit)
  * `day_of_week` (0-6, e dielë deri e shtunë)
  * `hour_of_day` (0-23)
  * `previous_bus_duration` (kohëzgjatja e urbanit të fundit në sekonda - tregues i trafikut aktual)
  * `travel_duration` (sekondat e marra - variabla që duam të parashikojmë)

---

### Faza 3: Stërvitja e Modelit (AI Model Training)

Kjo fazë kryhet jashtë mjedisit kryesor të aplikacionit (p.sh. në një Python Jupyter Notebook).

* Përdoret libraria `scikit-learn` ose `xgboost` për të trajnuar modelin:
  ```python
  from xgboost import XGBRegressor
  model = XGBRegressor()
  model.fit(X_train, y_train)
  ```
* Modeli konvertohet në formatin standard **ONNX**:
  ```python
  import skl2onnx
  # Konvertimi i modelit në formatin .onnx
  ```
* Skedari i gjeneruar `eta_model.onnx` kopjohet në projektin Next.js tek `/app/lib/models/eta_model.onnx`.

---

### Faza 4: Integrimi i Modeli ONNX në Server (Next.js API)

Që modeli të ekzekutohet shpejt dhe pa pasur nevojë për një server të dytë Python, ne do ta integrojmë skedarin ONNX direkt në Next.js duke përdorur runtime-in zyrtar të Microsoft.

#### Përditësimi i dependencave: [package.json](file:///Users/loredanavasej/AlbRoute/package.json)
* Shtohet dependenca `onnxruntime-node`:
  ```json
  "dependencies": {
    "onnxruntime-node": "^1.16.0"
  }
  ```

#### Skripti i Ri: [aiPredictor.ts](file:///Users/loredanavasej/AlbRoute/app/lib/aiPredictor.ts)
* Krijon një klasë Singleton që ngarkon skedarin `eta_model.onnx` në memorie.
* Ofron funksionin `predictSegmentDuration(segmentId, dayOfWeek, hour, prevDuration)` i cili ekzekuton parashikimin në më pak se 2 milisekonda.

---

### Faza 5: Përditësimi i API-së së Urbanëve

#### Përditësimi i API-së: [route.ts](file:///Users/loredanavasej/AlbRoute/app/api/buses/route.ts)
* Në vend të llogaritjes fizike me pjesëtim, API-ja thërret parashikuesin e IA-së për të përcaktuar kohën e mbetur për secilin stacion në vijim.
* Për stacionet e ardhshme $S_{next}, S_{next+1}, \dots$, mblidhen parashikimet individuale të modelit për ato segmente.

---

## Plani i Verifikimit

### Testimi i Saktësisë së Modelit (Offline)
* Gjatë trajnimit në Python, krahasohet shmangia mesatare absolute (MAE) midis formulës së thjeshtë fizike dhe modelit të IA-së. Modeli duhet të ketë një saktësi të paktën 35% më të lartë në orët e pikut.

### Testimi i Performancës së API-së (Online)
* Ekzekutimi i modelit ONNX në Node.js duhet të kryhet në më pak se 5ms për të shmangur vonesat në ngarkimin e hartës.
