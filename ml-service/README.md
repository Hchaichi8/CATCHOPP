# CatchOPP – ML Service (Client Reliability Predictor)

Python Flask microservice exposing the freelance client reliability ML pipeline.

## Port
`8091`

## Quick Start (local)

```bash
cd ml-service
python app.py
```

The service starts on `http://localhost:8089`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health + model status |
| POST | `/train` | Train all 3 models (upload CSV or use server-side file) |
| GET | `/benchmark` | Last training benchmark results |
| POST | `/predict` | Predict client reliability for 1+ records |
| GET | `/pca` | PCA scatter data for visualisation |

---

## POST /train

**Option A – Upload CSV:**
```
POST /train
Content-Type: multipart/form-data
file: <your_csv_file>
```

**Option B – Use server-side CSV** (place `freelancer_job_postings.csv` in `ml-service/`):
```json
POST /train
{ "use_default": true }
```

---

## POST /predict

```json
{
  "model": "rf",
  "data": [
    {
      "min_price": 100,
      "max_price": 500,
      "avg_price": 300,
      "client_average_rating": 4.5,
      "client_review_count": 12,
      "rate_type": "Fixed"
    }
  ]
}
```

**Models:** `rf` (Random Forest), `lr` (Logistic Regression), `mlp` (Neural Network)

**Response:**
```json
{
  "predictions": [
    {
      "good_match": 1,
      "probability_good": 0.87,
      "label": "Reliable"
    }
  ]
}
```

---

## Angular Route

Navigate to `/ClientReliabilityPredictor` in the Angular app (requires FREELANCER role).

## Docker

The service is included in `CatchOPP/docker-compose.yml` as `ml-service` on port `8089`.
Place your CSV dataset in the container at `/app/freelancer_job_postings.csv` or mount it as a volume.
