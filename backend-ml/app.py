import os
import pickle
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.preprocessing import OneHotEncoder
import numpy as np # Added for potential use in prediction alignment

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'Regresion lineal')
MODEL_PATH = os.path.join(MODEL_DIR, 'modelo_desempeño_futuro.pkl')
UPLOAD_FOLDER = os.path.join(MODEL_DIR, 'uploads')

# Create directories if they don't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Preprocessing helper functions ---
def preprocess_data_train(df):
    """Preprocesses the DataFrame for training."""
    # Ordinal encoding
    map_desempeno = {'bajo': 0, 'medio': 1, 'alto': 2}
    map_jerarquia = {'trainee': 0, 'junior': 1, 'senior': 2}
    df['desempeño'] = df['desempeño'].map(map_desempeno)
    df['jerarquia'] = df['jerarquia'].map(map_jerarquia)

    # Type conversion
    df['horas_extra'] = df['horas_extra'].astype(int)

    # One-Hot Encoding for 'area'
    ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    area_encoded = ohe.fit_transform(df[['area']])
    area_encoded_df = pd.DataFrame(area_encoded, columns=ohe.get_feature_names_out(['area']))
    
    df = pd.concat([df.drop('area', axis=1), area_encoded_df], axis=1)
    return df, ohe

def preprocess_data_predict(df, ohe, training_columns):
    """Preprocesses the DataFrame for prediction using a trained OneHotEncoder."""
    # Ordinal encoding
    map_desempeno = {'bajo': 0, 'medio': 1, 'alto': 2}
    map_jerarquia = {'trainee': 0, 'junior': 1, 'senior': 2}
    df['desempeño'] = df['desempeño'].map(map_desempeno)
    df['jerarquia'] = df['jerarquia'].map(map_jerarquia)

    # Type conversion
    df['horas_extra'] = df['horas_extra'].astype(int)

    # One-Hot Encoding for 'area'
    area_encoded = ohe.transform(df[['area']])
    area_encoded_df = pd.DataFrame(area_encoded, columns=ohe.get_feature_names_out(['area']))
    
    df = pd.concat([df.drop('area', axis=1), area_encoded_df], axis=1)

    # Align columns with training data
    for col in training_columns:
        if col not in df.columns:
            df[col] = 0 # Or some other default value / strategy
    df = df[training_columns] # Ensure correct order and subset of columns
    return df

# --- Training Endpoint ---
@app.route('/api/ml/regression/train', methods=['POST'])
def train_model():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        df = pd.read_csv(filepath)

        # Drop 'nombre' as it's not a feature
        if 'nombre' in df.columns:
            df = df.drop('nombre', axis=1)
        
        df_processed, ohe = preprocess_data_train(df.copy()) # Use a copy for preprocessing

        # Define features (X) and target (y)
        X = df_processed.drop('desempeño_futuro', axis=1)
        y = df_processed['desempeño_futuro']

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)

        # Train model
        model = LinearRegression()
        model.fit(X_train, y_train)

        # Evaluate model
        y_pred_test = model.predict(X_test)
        r2_test = r2_score(y_test, y_pred_test)

        # Save model, columns, and encoder
        model_data = {'modelo': model, 'columnas': list(X.columns), 'encoder': ohe}
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model_data, f)

        return jsonify({'message': 'Model trained successfully', 'r2_score': r2_test})

    except FileNotFoundError:
        return jsonify({'error': f"Uploaded file not found after saving: {file.filename}"}), 500
    except KeyError as e:
        return jsonify({'error': f"Missing expected column in CSV: {str(e)}"}), 400
    except ValueError as e:
        return jsonify({'error': f"Data type or value error during preprocessing: {str(e)}"}), 400
    except Exception as e:
        return jsonify({'error': f'An error occurred during training: {str(e)}'}), 500

# --- Prediction Endpoint ---
@app.route('/api/ml/regression/predict', methods=['POST'])
def predict_model():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Load model and preprocessing objects
        if not os.path.exists(MODEL_PATH):
            return jsonify({'error': 'Model not found. Please train the model first.'}), 404
        
        with open(MODEL_PATH, 'rb') as f:
            model_data = pickle.load(f)
        
        model = model_data['modelo']
        training_columns = model_data['columnas']
        ohe = model_data['encoder']

        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        df_predict = pd.read_csv(filepath)
        
        # Store original 'nombre' if present, then drop for prediction
        nombres = None
        if 'nombre' in df_predict.columns:
            nombres = df_predict['nombre']
            df_predict_processed = df_predict.drop('nombre', axis=1)
        else:
            df_predict_processed = df_predict.copy()


        df_predict_processed = preprocess_data_predict(df_predict_processed, ohe, training_columns)
        
        # Make predictions
        predictions = model.predict(df_predict_processed)
        
        # Prepare response
        # If 'nombre' was present, add it back to the results
        if nombres is not None:
            results_df = pd.DataFrame({'nombre': nombres, 'predicted_desempeño_futuro': predictions})
            return jsonify({'predictions': results_df.to_dict(orient='records')})
        else:
            return jsonify({'predictions': predictions.tolist()})

    except FileNotFoundError:
        # This handles missing model file (already checked) or missing uploaded file after saving
        return jsonify({'error': f"File not found: {file.filename}"}), 500
    except KeyError as e:
        return jsonify({'error': f"Missing expected column in CSV for prediction: {str(e)}. Make sure the CSV format matches the training data (excluding target)."}), 400
    except ValueError as e:
        return jsonify({'error': f"Data type or value error during prediction preprocessing: {str(e)}"}), 400
    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}") # Log the full error for debugging
        return jsonify({'error': f'An error occurred during prediction: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
