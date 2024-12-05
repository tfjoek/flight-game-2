from flask import Flask, jsonify, request, send_from_directory
from database import create_connection

app = Flask(__name__, static_folder="../frontend", static_url_path="")

# Reitti HTML-etusivulle
@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

# Pelaajan tilan haku
@app.route('/player/<int:player_id>', methods=['GET'])
def get_player_status(player_id):
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT location, fuel, war_points FROM game WHERE id = %s"
        cursor.execute(query, (player_id,))
        player = cursor.fetchone()
        cursor.close()
        conn.close()
        if player:
            return jsonify(player)
    return jsonify({"error": "Player not found"}), 404

# Satunnainen lentokenttä
@app.route('/random-airport', methods=['GET'])
def random_airport():
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT ident, name, owner FROM airport ORDER BY RAND() LIMIT 1"
        cursor.execute(query)
        airport = cursor.fetchone()
        cursor.close()
        conn.close()
        if airport:
            return jsonify(airport)
    return jsonify({"error": "No airports found"}), 404

# Reitti KARTTAAN DEMON CAT 
@app.route('/map')
def serve_map():
    return send_from_directory('../frontend/map', 'map.html')

# GET LOCATIONS FOR MAP
@app.route('/locations', methods=['GET'])
def get_locations():
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT name, latitude_deg, longitude_deg, owner FROM airport"
        cursor.execute(query)
        locations = cursor.fetchall()
        cursor.close()
        conn.close()
        if locations:
            return jsonify(locations)
    return jsonify({"error": "No locations found"}), 404

if __name__ == "__main__":
    app.run(debug=True)