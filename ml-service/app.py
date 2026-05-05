# -*- coding: utf-8 -*-
"""
CatchOPP – Client Reliability Prediction Microservice
Flask REST API wrapping the ML pipeline from the Colab notebook.
Port: 8089
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
import os
import pickle
import json

app = Flask(__name__)
CORS(app)  # Allow Angular dev server (localhost:4200) and any origin

# ─── Paths ────────────────────────────────────────────────────────────────────
DATA_PATH   = os.environ.get("DATA_PATH", "freelancer_job_postings.csv")
MODEL_DIR   = os.environ.get("MODEL_DIR", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ─── Global state (loaded once at startup or after /train) ────────────────────
_scaler      = None
_pca         = None
_rf_model    = None
_log_model   = None
_mlp_model   = None
_feature_cols = None
_benchmark   = {}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _save_artifacts():
    with open(f"{MODEL_DIR}/scaler.pkl",   "wb") as f: pickle.dump(_scaler,       f)
    with open(f"{MODEL_DIR}/pca.pkl",      "wb") as f: pickle.dump(_pca,          f)
    with open(f"{MODEL_DIR}/rf.pkl",       "wb") as f: pickle.dump(_rf_model,     f)
    with open(f"{MODEL_DIR}/lr.pkl",       "wb") as f: pickle.dump(_log_model,    f)
    with open(f"{MODEL_DIR}/mlp.pkl",      "wb") as f: pickle.dump(_mlp_model,    f)
    with open(f"{MODEL_DIR}/features.json","w")  as f: json.dump(_feature_cols,   f)
    with open(f"{MODEL_DIR}/benchmark.json","w") as f: json.dump(_benchmark,      f)


def _load_artifacts():
    global _scaler, _pca, _rf_model, _log_model, _mlp_model, _feature_cols, _benchmark
    try:
        with open(f"{MODEL_DIR}/scaler.pkl",    "rb") as f: _scaler       = pickle.load(f)
        with open(f"{MODEL_DIR}/pca.pkl",       "rb") as f: _pca          = pickle.load(f)
        with open(f"{MODEL_DIR}/rf.pkl",        "rb") as f: _rf_model     = pickle.load(f)
        with open(f"{MODEL_DIR}/lr.pkl",        "rb") as f: _log_model    = pickle.load(f)
        with open(f"{MODEL_DIR}/mlp.pkl",       "rb") as f: _mlp_model    = pickle.load(f)
        with open(f"{MODEL_DIR}/features.json", "r")  as f: _feature_cols = json.load(f)
        with open(f"{MODEL_DIR}/benchmark.json","r")  as f: _benchmark    = json.load(f)
        return True
    except FileNotFoundError:
        return False


def _train_pipeline(df_raw: pd.DataFrame):
    """Full pipeline: clean → encode → scale → train → evaluate."""
    global _scaler, _pca, _rf_model, _log_model, _mlp_model, _feature_cols, _benchmark

    df = df_raw.copy()

    # ── 2.1 Missing values ────────────────────────────────────────────────────
    df["client_state"] = df["client_state"].fillna("Unknown")
    df = df.dropna(subset=["client_country"])

    # ── 2.2 One-Hot Encoding ──────────────────────────────────────────────────
    if "rate_type" in df.columns:
        df = pd.get_dummies(df, columns=["rate_type"], drop_first=True)

    # ── 2.3 Normalisation ─────────────────────────────────────────────────────
    num_cols = ["min_price", "max_price", "avg_price",
                "client_average_rating", "client_review_count"]
    num_cols = [c for c in num_cols if c in df.columns]

    _scaler = MinMaxScaler()
    df[num_cols] = _scaler.fit_transform(df[num_cols])

    # ── 3.1 Target variable ───────────────────────────────────────────────────
    df["good_match"] = (
        (df["client_average_rating"] >= (4 / 5)) &
        (df["client_review_count"] > 0)
    ).astype(int)

    # ── 3.2 Feature matrix ────────────────────────────────────────────────────
    drop_cols = [c for c in
                 ["projectId", "job_title", "job_description", "tags",
                  "currency", "client_state", "client_country", "good_match"]
                 if c in df.columns]
    X = df.drop(columns=drop_cols)
    y = df["good_match"]
    _feature_cols = X.columns.tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ── 3.3 Train models ──────────────────────────────────────────────────────
    _rf_model  = RandomForestClassifier(n_estimators=100, random_state=42)
    _rf_model.fit(X_train, y_train)

    _log_model = LogisticRegression(random_state=42, max_iter=200)
    _log_model.fit(X_train, y_train)

    _mlp_model = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=200, random_state=42)
    _mlp_model.fit(X_train, y_train)

    # ── 3.4 Benchmark ─────────────────────────────────────────────────────────
    def _eval(model, name):
        pred = model.predict(X_test)
        report = classification_report(y_test, pred, output_dict=True)
        return {
            "accuracy": round(accuracy_score(y_test, pred), 4),
            "f1_score": round(f1_score(y_test, pred), 4),
            "precision_0": round(report["0"]["precision"], 4),
            "recall_0":    round(report["0"]["recall"],    4),
            "precision_1": round(report["1"]["precision"], 4),
            "recall_1":    round(report["1"]["recall"],    4),
        }

    _benchmark = {
        "Random Forest":       _eval(_rf_model,  "Random Forest"),
        "Logistic Regression": _eval(_log_model, "Logistic Regression"),
        "ANN (MLPClassifier)": _eval(_mlp_model, "ANN (MLPClassifier)"),
    }

    # ── PCA (for visualisation endpoint) ─────────────────────────────────────
    pca_features = num_cols + [c for c in _feature_cols if "rate_type" in c]
    pca_features = [c for c in pca_features if c in X.columns]
    _pca = PCA(n_components=2)
    _pca.fit(X[pca_features])

    _save_artifacts()
    return _benchmark


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_loaded": _rf_model is not None})


@app.route("/train", methods=["POST"])
def train():
    """
    Train (or re-train) all models.
    Expects multipart/form-data with a CSV file field named 'file',
    OR a JSON body with { "use_default": true } to use the server-side CSV.
    """
    try:
        if "file" in request.files:
            file = request.files["file"]
            df = pd.read_csv(file)
        else:
            if not os.path.exists(DATA_PATH):
                return jsonify({"error": f"Dataset not found at {DATA_PATH}. Upload a CSV file."}), 400
            df = pd.read_csv(DATA_PATH)

        benchmark = _train_pipeline(df)
        return jsonify({
            "message": "Training complete",
            "rows_used": len(df),
            "benchmark": benchmark
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/benchmark", methods=["GET"])
def benchmark():
    """Return the last benchmark results."""
    if not _benchmark:
        if not _load_artifacts():
            return jsonify({"error": "Models not trained yet. Call POST /train first."}), 400
    return jsonify(_benchmark)


@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict client reliability for one or more records.

    Body (JSON):
    {
      "model": "rf" | "lr" | "mlp"   (default: "rf"),
      "data": [
        {
          "min_price": 100,
          "max_price": 500,
          "avg_price": 300,
          "client_average_rating": 4.5,
          "client_review_count": 12,
          "rate_type": "Fixed"          // optional
        }
      ]
    }

    Returns:
    {
      "predictions": [
        { "good_match": 1, "probability_good": 0.87, "label": "Reliable" }
      ]
    }
    """
    global _scaler, _rf_model, _log_model, _mlp_model, _feature_cols

    # Lazy-load from disk if not in memory
    if _rf_model is None:
        if not _load_artifacts():
            return jsonify({"error": "Models not trained yet. Call POST /train first."}), 400

    body = request.get_json(force=True)
    if not body or "data" not in body:
        return jsonify({"error": "Request body must contain a 'data' array."}), 400

    model_key = body.get("model", "rf").lower()
    model_map  = {"rf": _rf_model, "lr": _log_model, "mlp": _mlp_model}
    model = model_map.get(model_key)
    if model is None:
        return jsonify({"error": f"Unknown model '{model_key}'. Use rf, lr, or mlp."}), 400

    try:
        records = body["data"]
        df_in = pd.DataFrame(records)

        # One-hot encode rate_type if present
        if "rate_type" in df_in.columns:
            df_in = pd.get_dummies(df_in, columns=["rate_type"], drop_first=True)

        # Align columns to training feature set
        for col in _feature_cols:
            if col not in df_in.columns:
                df_in[col] = 0
        df_in = df_in[_feature_cols]

        # Scale numeric columns
        num_cols = ["min_price", "max_price", "avg_price",
                    "client_average_rating", "client_review_count"]
        num_cols_present = [c for c in num_cols if c in df_in.columns]
        df_in[num_cols_present] = _scaler.transform(df_in[num_cols_present])

        preds = model.predict(df_in)
        proba = model.predict_proba(df_in)[:, 1] if hasattr(model, "predict_proba") else preds.astype(float)

        results = []
        for pred, prob in zip(preds, proba):
            results.append({
                "good_match":      int(pred),
                "probability_good": round(float(prob), 4),
                "label":           "Reliable" if pred == 1 else "Unreliable"
            })

        return jsonify({"predictions": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/pca", methods=["GET"])
def pca_data():
    """Return PCA scatter data for visualisation (sample of 500 points)."""
    global _pca, _scaler, _feature_cols

    if _pca is None:
        if not _load_artifacts():
            return jsonify({"error": "Models not trained yet."}), 400

    if not os.path.exists(DATA_PATH):
        return jsonify({"error": f"Dataset not found at {DATA_PATH}."}), 400

    try:
        df = pd.read_csv(DATA_PATH)
        df["client_state"] = df["client_state"].fillna("Unknown")
        df = df.dropna(subset=["client_country"])
        if "rate_type" in df.columns:
            df = pd.get_dummies(df, columns=["rate_type"], drop_first=True)

        num_cols = ["min_price", "max_price", "avg_price",
                    "client_average_rating", "client_review_count"]
        num_cols = [c for c in num_cols if c in df.columns]
        df[num_cols] = _scaler.transform(df[num_cols])

        df["good_match"] = (
            (df["client_average_rating"] >= (4 / 5)) &
            (df["client_review_count"] > 0)
        ).astype(int)

        pca_features = num_cols + [c for c in df.columns if "rate_type" in c]
        X_pca = df[pca_features].copy()
        components = _pca.transform(X_pca)

        sample_size = min(500, len(components))
        idx = np.random.choice(len(components), sample_size, replace=False)

        points = [
            {
                "x":     round(float(components[i, 0]), 4),
                "y":     round(float(components[i, 1]), 4),
                "label": int(df["good_match"].iloc[i])
            }
            for i in idx
        ]
        return jsonify({"points": points})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Startup ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    _load_artifacts()   # warm-up from disk if models already exist
    app.run(host="0.0.0.0", port=8089, debug=False)
