# -*- coding: utf-8 -*-
"""
CatchOPP – ML Microservice
Three business objectives:
  BO1 /predict   – Classification  (Client Reliability)
  BO2 /recommend – Recommendation  (Freelancer–Project Matching)
  BO3 /price/*   – Regression      (Project Price Prediction)
Port: 8089
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import (accuracy_score, f1_score, classification_report,
                              mean_absolute_error, mean_squared_error, r2_score)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
import pickle
import json

app = Flask(__name__)
CORS(app)

# ─── Paths ────────────────────────────────────────────────────────────────────
DATA_PATH = os.environ.get("DATA_PATH", "freelancer_job_postings.csv")
MODEL_DIR = os.environ.get("MODEL_DIR", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ══════════════════════════════════════════════════════════════════════════════
#  BO1 – CLASSIFICATION  (Client Reliability)
# ══════════════════════════════════════════════════════════════════════════════

_scaler       = None
_pca          = None
_rf_model     = None
_log_model    = None
_mlp_model    = None
_feature_cols = None
_benchmark    = {}


def _bo1_save():
    with open(f"{MODEL_DIR}/scaler.pkl",    "wb") as f: pickle.dump(_scaler,       f)
    with open(f"{MODEL_DIR}/pca.pkl",       "wb") as f: pickle.dump(_pca,          f)
    with open(f"{MODEL_DIR}/rf.pkl",        "wb") as f: pickle.dump(_rf_model,     f)
    with open(f"{MODEL_DIR}/lr.pkl",        "wb") as f: pickle.dump(_log_model,    f)
    with open(f"{MODEL_DIR}/mlp.pkl",       "wb") as f: pickle.dump(_mlp_model,    f)
    with open(f"{MODEL_DIR}/features.json", "w")  as f: json.dump(_feature_cols,   f)
    with open(f"{MODEL_DIR}/benchmark.json","w")  as f: json.dump(_benchmark,      f)


def _bo1_load():
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


def _bo1_train(df_raw: pd.DataFrame):
    global _scaler, _pca, _rf_model, _log_model, _mlp_model, _feature_cols, _benchmark
    df = df_raw.copy()
    df["client_state"] = df["client_state"].fillna("Unknown")
    df = df.dropna(subset=["client_country"])
    if "rate_type" in df.columns:
        df = pd.get_dummies(df, columns=["rate_type"], drop_first=True)
    num_cols = [c for c in ["min_price", "max_price", "avg_price",
                             "client_average_rating", "client_review_count"] if c in df.columns]
    _scaler = MinMaxScaler()
    df[num_cols] = _scaler.fit_transform(df[num_cols])
    df["good_match"] = ((df["client_average_rating"] >= 4/5) & (df["client_review_count"] > 0)).astype(int)
    drop_cols = [c for c in ["projectId","job_title","job_description","tags",
                              "currency","client_state","client_country","good_match"] if c in df.columns]
    X = df.drop(columns=drop_cols)
    y = df["good_match"]
    _feature_cols = X.columns.tolist()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    _rf_model  = RandomForestClassifier(n_estimators=100, random_state=42)
    _rf_model.fit(X_train, y_train)
    _log_model = LogisticRegression(random_state=42, max_iter=200)
    _log_model.fit(X_train, y_train)
    _mlp_model = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=200, random_state=42)
    _mlp_model.fit(X_train, y_train)

    def _eval(model):
        pred = model.predict(X_test)
        rep  = classification_report(y_test, pred, output_dict=True)
        return {"accuracy": round(accuracy_score(y_test, pred), 4),
                "f1_score": round(f1_score(y_test, pred), 4),
                "precision_0": round(rep["0"]["precision"], 4), "recall_0": round(rep["0"]["recall"], 4),
                "precision_1": round(rep["1"]["precision"], 4), "recall_1": round(rep["1"]["recall"], 4)}

    _benchmark = {"Random Forest": _eval(_rf_model),
                  "Logistic Regression": _eval(_log_model),
                  "ANN (MLPClassifier)": _eval(_mlp_model)}
    pca_features = num_cols + [c for c in _feature_cols if "rate_type" in c]
    pca_features = [c for c in pca_features if c in X.columns]
    _pca = PCA(n_components=2)
    _pca.fit(X[pca_features])
    _bo1_save()
    return _benchmark


# ══════════════════════════════════════════════════════════════════════════════
#  BO2 – RECOMMENDATION  (Freelancer–Project Matching)
# ══════════════════════════════════════════════════════════════════════════════

_rec_tfidf    = None
_rec_matrix   = None   # TF-IDF matrix of all projects
_rec_df       = None   # cleaned project dataframe
_rec_trained  = False


def _bo2_save():
    with open(f"{MODEL_DIR}/rec_tfidf.pkl",  "wb") as f: pickle.dump(_rec_tfidf,  f)
    with open(f"{MODEL_DIR}/rec_matrix.pkl", "wb") as f: pickle.dump(_rec_matrix, f)
    _rec_df.to_pickle(f"{MODEL_DIR}/rec_df.pkl")


def _bo2_load():
    global _rec_tfidf, _rec_matrix, _rec_df, _rec_trained
    try:
        with open(f"{MODEL_DIR}/rec_tfidf.pkl",  "rb") as f: _rec_tfidf  = pickle.load(f)
        with open(f"{MODEL_DIR}/rec_matrix.pkl", "rb") as f: _rec_matrix = pickle.load(f)
        _rec_df = pd.read_pickle(f"{MODEL_DIR}/rec_df.pkl")
        _rec_trained = True
        return True
    except FileNotFoundError:
        return False


def _bo2_train(df_raw: pd.DataFrame):
    global _rec_tfidf, _rec_matrix, _rec_df, _rec_trained
    df = df_raw.copy()

    # Build a rich text field combining job_title + tags + rate_type + client_country
    text_parts = []
    for col in ["job_title", "tags", "rate_type", "client_country"]:
        if col in df.columns:
            text_parts.append(df[col].fillna("").astype(str))
    df["_content"] = pd.concat(text_parts, axis=1).apply(lambda r: " ".join(r), axis=1)
    df["_content"] = df["_content"].str.lower().str.replace(r"[^a-z0-9 ]", " ", regex=True)

    # Keep useful display columns
    keep = ["_content"]
    for c in ["projectId", "job_title", "tags", "avg_price", "rate_type",
              "client_country", "client_average_rating", "client_review_count"]:
        if c in df.columns:
            keep.append(c)
    _rec_df = df[keep].reset_index(drop=True)

    # TF-IDF on content
    _rec_tfidf  = TfidfVectorizer(max_features=500, stop_words="english")
    _rec_matrix = _rec_tfidf.fit_transform(_rec_df["_content"])

    _rec_trained = True
    _bo2_save()
    return {"message": "Recommendation engine trained", "projects_indexed": len(_rec_df)}


def _bo2_recommend(skills: str, top_n: int = 5):
    """Given a freelancer's skills string, return top_n matching projects."""
    query_vec = _rec_tfidf.transform([skills.lower()])
    scores    = cosine_similarity(query_vec, _rec_matrix).flatten()
    top_idx   = scores.argsort()[::-1][:top_n]
    results   = []
    for i in top_idx:
        row = _rec_df.iloc[i]
        results.append({
            "rank":           int(i),
            "score":          round(float(scores[i]), 4),
            "job_title":      str(row.get("job_title", "")),
            "tags":           str(row.get("tags", "")),
            "avg_price":      float(row.get("avg_price", 0)) if pd.notna(row.get("avg_price")) else 0,
            "rate_type":      str(row.get("rate_type", "")),
            "client_country": str(row.get("client_country", "")),
            "client_rating":  float(row.get("client_average_rating", 0)) if pd.notna(row.get("client_average_rating")) else 0,
        })
    return results


# ══════════════════════════════════════════════════════════════════════════════
#  BO3 – REGRESSION  (Project Price Prediction)
# ══════════════════════════════════════════════════════════════════════════════

_price_scaler_X  = None
_price_scaler_y  = None
_price_lr        = None   # Linear Regression
_price_dt        = None   # Decision Tree
_price_ann       = None   # MLP Regressor
_price_features  = None
_price_benchmark = {}


def _bo3_save():
    with open(f"{MODEL_DIR}/price_scaler_X.pkl",  "wb") as f: pickle.dump(_price_scaler_X,  f)
    with open(f"{MODEL_DIR}/price_scaler_y.pkl",  "wb") as f: pickle.dump(_price_scaler_y,  f)
    with open(f"{MODEL_DIR}/price_lr.pkl",        "wb") as f: pickle.dump(_price_lr,        f)
    with open(f"{MODEL_DIR}/price_dt.pkl",        "wb") as f: pickle.dump(_price_dt,        f)
    with open(f"{MODEL_DIR}/price_ann.pkl",       "wb") as f: pickle.dump(_price_ann,       f)
    with open(f"{MODEL_DIR}/price_features.json", "w")  as f: json.dump(_price_features,    f)
    with open(f"{MODEL_DIR}/price_benchmark.json","w")  as f: json.dump(_price_benchmark,   f)


def _bo3_load():
    global _price_scaler_X, _price_scaler_y, _price_lr, _price_dt, _price_ann, _price_features, _price_benchmark
    try:
        with open(f"{MODEL_DIR}/price_scaler_X.pkl",  "rb") as f: _price_scaler_X  = pickle.load(f)
        with open(f"{MODEL_DIR}/price_scaler_y.pkl",  "rb") as f: _price_scaler_y  = pickle.load(f)
        with open(f"{MODEL_DIR}/price_lr.pkl",        "rb") as f: _price_lr        = pickle.load(f)
        with open(f"{MODEL_DIR}/price_dt.pkl",        "rb") as f: _price_dt        = pickle.load(f)
        with open(f"{MODEL_DIR}/price_ann.pkl",       "rb") as f: _price_ann       = pickle.load(f)
        with open(f"{MODEL_DIR}/price_features.json", "r")  as f: _price_features  = json.load(f)
        with open(f"{MODEL_DIR}/price_benchmark.json","r")  as f: _price_benchmark = json.load(f)
        return True
    except FileNotFoundError:
        return False


def _bo3_train(df_raw: pd.DataFrame):
    global _price_scaler_X, _price_scaler_y, _price_lr, _price_dt, _price_ann, _price_features, _price_benchmark
    df = df_raw.copy()

    # Target: avg_price (drop rows where it's missing or zero)
    if "avg_price" not in df.columns:
        raise ValueError("Column 'avg_price' not found in dataset.")
    df = df.dropna(subset=["avg_price"])
    df = df[df["avg_price"] > 0]

    # Features: min_price, max_price, client_average_rating, client_review_count + rate_type encoded
    if "rate_type" in df.columns:
        df = pd.get_dummies(df, columns=["rate_type"], drop_first=True)

    feature_candidates = ["min_price", "max_price", "client_average_rating",
                          "client_review_count"] + [c for c in df.columns if "rate_type" in c]
    feature_cols = [c for c in feature_candidates if c in df.columns]
    df[feature_cols] = df[feature_cols].fillna(0)

    X = df[feature_cols].values
    y = df["avg_price"].values.reshape(-1, 1)

    _price_features  = feature_cols
    _price_scaler_X  = MinMaxScaler()
    _price_scaler_y  = MinMaxScaler()
    X_scaled = _price_scaler_X.fit_transform(X)
    y_scaled = _price_scaler_y.fit_transform(y).ravel()

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_scaled, test_size=0.2, random_state=42)

    _price_lr  = LinearRegression()
    _price_lr.fit(X_train, y_train)

    _price_dt  = DecisionTreeRegressor(max_depth=8, random_state=42)
    _price_dt.fit(X_train, y_train)

    _price_ann = MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=300, random_state=42)
    _price_ann.fit(X_train, y_train)

    def _eval_reg(model, name):
        pred_scaled = model.predict(X_test)
        pred = _price_scaler_y.inverse_transform(pred_scaled.reshape(-1, 1)).ravel()
        real = _price_scaler_y.inverse_transform(y_test.reshape(-1, 1)).ravel()
        return {
            "mae":  round(float(mean_absolute_error(real, pred)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(real, pred))), 2),
            "r2":   round(float(r2_score(real, pred)), 4),
        }

    _price_benchmark = {
        "Linear Regression":  _eval_reg(_price_lr,  "Linear Regression"),
        "Decision Tree":      _eval_reg(_price_dt,  "Decision Tree"),
        "ANN (MLPRegressor)": _eval_reg(_price_ann, "ANN (MLPRegressor)"),
    }
    _bo3_save()
    return _price_benchmark


# ══════════════════════════════════════════════════════════════════════════════
#  ROUTES – BO1  (Classification)
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "bo1_models_loaded": _rf_model is not None,
        "bo2_rec_loaded":    _rec_trained,
        "bo3_price_loaded":  _price_lr is not None,
    })


@app.route("/train", methods=["POST"])
def train():
    try:
        if "file" in request.files:
            df = pd.read_csv(request.files["file"])
        else:
            if not os.path.exists(DATA_PATH):
                return jsonify({"error": f"Dataset not found at {DATA_PATH}."}), 400
            df = pd.read_csv(DATA_PATH)
        result = _bo1_train(df)
        return jsonify({"message": "BO1 training complete", "rows_used": len(df), "benchmark": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/benchmark", methods=["GET"])
def benchmark():
    if not _benchmark:
        if not _bo1_load():
            return jsonify({"error": "BO1 models not trained yet."}), 400
    return jsonify(_benchmark)


@app.route("/predict", methods=["POST"])
def predict():
    global _scaler, _rf_model, _log_model, _mlp_model, _feature_cols
    if _rf_model is None:
        if not _bo1_load():
            return jsonify({"error": "BO1 models not trained yet. Call POST /train first."}), 400
    body = request.get_json(force=True)
    if not body or "data" not in body:
        return jsonify({"error": "Request body must contain a 'data' array."}), 400
    model_key = body.get("model", "rf").lower()
    model_map  = {"rf": _rf_model, "lr": _log_model, "mlp": _mlp_model}
    model = model_map.get(model_key)
    if model is None:
        return jsonify({"error": f"Unknown model '{model_key}'. Use rf, lr, or mlp."}), 400
    try:
        df_in = pd.DataFrame(body["data"])
        if "rate_type" in df_in.columns:
            df_in = pd.get_dummies(df_in, columns=["rate_type"], drop_first=True)
        for col in _feature_cols:
            if col not in df_in.columns:
                df_in[col] = 0
        df_in = df_in[_feature_cols]
        num_cols = [c for c in ["min_price","max_price","avg_price",
                                 "client_average_rating","client_review_count"] if c in df_in.columns]
        df_in[num_cols] = _scaler.transform(df_in[num_cols])
        preds = model.predict(df_in)
        proba = model.predict_proba(df_in)[:, 1] if hasattr(model, "predict_proba") else preds.astype(float)
        return jsonify({"predictions": [
            {"good_match": int(p), "probability_good": round(float(pb), 4),
             "label": "Reliable" if p == 1 else "Unreliable"}
            for p, pb in zip(preds, proba)
        ]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/pca", methods=["GET"])
def pca_data():
    if _pca is None:
        if not _bo1_load():
            return jsonify({"error": "BO1 models not trained yet."}), 400
    if not os.path.exists(DATA_PATH):
        return jsonify({"error": f"Dataset not found at {DATA_PATH}."}), 400
    try:
        df = pd.read_csv(DATA_PATH)
        df["client_state"] = df["client_state"].fillna("Unknown")
        df = df.dropna(subset=["client_country"])
        if "rate_type" in df.columns:
            df = pd.get_dummies(df, columns=["rate_type"], drop_first=True)
        num_cols = [c for c in ["min_price","max_price","avg_price",
                                 "client_average_rating","client_review_count"] if c in df.columns]
        df[num_cols] = _scaler.transform(df[num_cols])
        df["good_match"] = ((df["client_average_rating"] >= 4/5) & (df["client_review_count"] > 0)).astype(int)
        pca_features = num_cols + [c for c in df.columns if "rate_type" in c]
        components   = _pca.transform(df[pca_features].copy())
        idx = np.random.choice(len(components), min(500, len(components)), replace=False)
        return jsonify({"points": [
            {"x": round(float(components[i,0]),4), "y": round(float(components[i,1]),4),
             "label": int(df["good_match"].iloc[i])}
            for i in idx
        ]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════════════════════════
#  ROUTES – BO2  (Recommendation)
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/recommend/train", methods=["POST"])
def recommend_train():
    try:
        if "file" in request.files:
            df = pd.read_csv(request.files["file"])
        else:
            if not os.path.exists(DATA_PATH):
                return jsonify({"error": f"Dataset not found at {DATA_PATH}."}), 400
            df = pd.read_csv(DATA_PATH)
        result = _bo2_train(df)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/recommend", methods=["POST"])
def recommend():
    """
    Body: { "skills": "python machine learning data analysis", "top_n": 5 }
    Returns top N matching job postings.
    """
    global _rec_trained
    if not _rec_trained:
        if not _bo2_load():
            return jsonify({"error": "Recommendation engine not trained yet. Call POST /recommend/train first."}), 400
    body = request.get_json(force=True)
    if not body or "skills" not in body:
        return jsonify({"error": "Request body must contain 'skills' string."}), 400
    try:
        top_n   = int(body.get("top_n", 5))
        results = _bo2_recommend(body["skills"], top_n)
        return jsonify({"recommendations": results, "query": body["skills"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════════════════════════
#  ROUTES – BO3  (Price Regression)
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/price/train", methods=["POST"])
def price_train():
    try:
        if "file" in request.files:
            df = pd.read_csv(request.files["file"])
        else:
            if not os.path.exists(DATA_PATH):
                return jsonify({"error": f"Dataset not found at {DATA_PATH}."}), 400
            df = pd.read_csv(DATA_PATH)
        result = _bo3_train(df)
        return jsonify({"message": "BO3 price training complete", "rows_used": len(df), "benchmark": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/price/benchmark", methods=["GET"])
def price_benchmark():
    if not _price_benchmark:
        if not _bo3_load():
            return jsonify({"error": "Price models not trained yet. Call POST /price/train first."}), 400
    return jsonify(_price_benchmark)


@app.route("/price/predict", methods=["POST"])
def price_predict():
    """
    Body:
    {
      "model": "lr" | "dt" | "ann"  (default: "dt"),
      "data": [
        { "min_price": 100, "max_price": 500,
          "client_average_rating": 4.2, "client_review_count": 8,
          "rate_type": "Fixed" }
      ]
    }
    Returns: { "predictions": [ { "predicted_avg_price": 312.5 } ] }
    """
    global _price_scaler_X, _price_scaler_y, _price_lr, _price_dt, _price_ann, _price_features
    if _price_lr is None:
        if not _bo3_load():
            return jsonify({"error": "Price models not trained yet. Call POST /price/train first."}), 400
    body = request.get_json(force=True)
    if not body or "data" not in body:
        return jsonify({"error": "Request body must contain a 'data' array."}), 400
    model_key = body.get("model", "dt").lower()
    model_map  = {"lr": _price_lr, "dt": _price_dt, "ann": _price_ann}
    model = model_map.get(model_key)
    if model is None:
        return jsonify({"error": f"Unknown model '{model_key}'. Use lr, dt, or ann."}), 400
    try:
        df_in = pd.DataFrame(body["data"])
        if "rate_type" in df_in.columns:
            df_in = pd.get_dummies(df_in, columns=["rate_type"], drop_first=True)
        for col in _price_features:
            if col not in df_in.columns:
                df_in[col] = 0
        df_in = df_in[_price_features].fillna(0)
        X_scaled = _price_scaler_X.transform(df_in.values)
        pred_scaled = model.predict(X_scaled)
        pred_prices = _price_scaler_y.inverse_transform(pred_scaled.reshape(-1, 1)).ravel()
        return jsonify({"predictions": [
            {"predicted_avg_price": round(float(p), 2)} for p in pred_prices
        ]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Startup ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    _bo1_load()
    _bo2_load()
    _bo3_load()
    app.run(host="0.0.0.0", port=8091, debug=False)
