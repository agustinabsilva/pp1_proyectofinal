from flask import Flask, jsonify
from flask_cors import CORS

import requests

app = Flask(__name__)
CORS(app, supports_credentials=True)

METABASE_URL = 'http://54.172.128.185:3000'
USERNAME = 'ceciliactorales@gmail.com'
PASSWORD = 'AINABI2025'

@app.route('/metabase-auth', methods=['POST'])
def metabase_auth():
    auth_url = f'{METABASE_URL}/api/session'
    response = requests.post(auth_url, json={"username": USERNAME, "password": PASSWORD})
    if response.status_code == 200:
        session_token = response.json().get('id')
        return jsonify({'token': session_token})
    else:
        return jsonify({'error': 'Authentication failed'}), 401

if __name__ == '__main__':
    app.run(port=5000)

    @app.route('/metabase-dashboard/<int:dashboard_id>', methods=['GET', 'OPTIONS'])
def get_dashboard(dashboard_id):
    if request.method == 'OPTIONS':
        # Manejo de preflight CORS
        return jsonify({'status': 'OK'}), 200
    token = request.headers.get('X-Metabase-Session')
    if not token:
        return jsonify({'error': 'Token no proporcionado'}), 401
    headers = {'X-Metabase-Session': token}
    response = requests.get(f'{METABASE_URL}/api/dashboard/{dashboard_id}', headers=headers)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Error al obtener el dashboard'}), response.status_code

"""
@app.route('/metabase-dashboard/<int:dashboard_id>', methods=['GET', 'OPTIONS'])
def get_dashboard(dashboard_id):
    if request.method == 'OPTIONS':
        # Manejo de preflight CORS
        return jsonify({'status': 'OK'}), 200
    token = request.headers.get('X-Metabase-Session')
    if not token:
        return jsonify({'error': 'Token no proporcionado'}), 401
    headers = {'X-Metabase-Session': token}
    response = requests.get(f'{METABASE_URL}/api/dashboard/{dashboard_id}', headers=headers)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Error al obtener el dashboard'}), response.status_code
"""

"""@app.route('/metabase-dashboard-data/<int:dashboard_id>', methods=['GET'])
def get_dashboard_data(dashboard_id):
    token = request.headers.get('X-Metabase-Session')
    if not token:
        return jsonify({'error': 'Token no proporcionado'}), 401

    headers = {'X-Metabase-Session': token}

    # 1. Obtener la estructura del dashboard
    response = requests.get(f'{METABASE_URL}/api/dashboard/{dashboard_id}', headers=headers)
    if response.status_code != 200:
        return jsonify({'error': 'Error al obtener el dashboard'}), response.status_code

    dashboard = response.json()
    cards = dashboard.get('ordered_cards', [])

    # 2. Asumamos que queremos solo la PRIMERA tarjeta
    if not cards:
        return jsonify({'error': 'No hay tarjetas en el dashboard'}), 404

    card_id = cards[0]['card']['id']  # ID de la primera tarjeta

    # 3. Obtener los datos de la tarjeta
    data_response = requests.get(f'{METABASE_URL}/api/card/{card_id}/query/json', headers=headers)
    if data_response.status_code != 200:
        return jsonify({'error': 'Error al obtener los datos de la tarjeta'}), data_response.status_code

    raw_data = data_response.json()

    # 4. Formatear los datos para Chart.js
    # Suponiendo que cada objeto tiene "label" y "valor"
    try:
        labels = [item['label'] for item in raw_data]
        data = [item['valor'] for item in raw_data]
    except KeyError:
        return jsonify({'error': 'Formato inesperado de datos'}), 500

    return jsonify({
        "labels": labels,
        "data": data
    })       """