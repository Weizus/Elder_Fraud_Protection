import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'balanced_spam.csv')
TEST_DATA_PATH = os.path.join(BASE_DIR, 'test_dataset.csv')


model = None
vectorizer = None

def train_model():
    global model, vectorizer

    if os.path.exists(DATA_PATH):
        print("Using full dataset")
        path = DATA_PATH
    elif os.path.exists(TEST_DATA_PATH):
        print("Warning: Full dataset not found, using test dataset")
        path = TEST_DATA_PATH
    else:
        print("Warning: No dataset found. AI features disabled.")
        return None, None

    df = pd.read_csv(path)
    
    df = df.dropna(subset=['text', 'label'])

    X = df['text']
    y = df['label']

    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Vectorize the text using TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_vec, y_train)

    # Print accuracy report to console on startup
    y_pred = model.predict(X_test_vec)
    print("Model trained successfully")
    print(classification_report(y_test, y_pred, target_names=['legitimate', 'phishing', 'spam']))

    return model, vectorizer

# Train once when the module is first imported
model, vectorizer = train_model()

LABELS = {
    0: 'legitimate',
    1: 'phishing',
    2: 'spam'
}

def analyze_text(text):
    if model is None or vectorizer is None:
        return {"error": "Model not available - dataset missing"}

    vectorized_text = vectorizer.transform([text])
    pred_label = model.predict(vectorized_text)[0]
    pred_score = model.predict_proba(vectorized_text)[0][pred_label]
    return{
        "pred_label" : LABELS[pred_label],
        "pred_score" : round(float(pred_score) * 100, 2),
        "summary" : "None",
        "red_flags":[],
        "next_steps":"None",
        "explanation" : "None"
    }
