from flask import Flask, jsonify, request, send_from_directory
from database import create_connection

app = Flask(__name__, static_folder="../frontend", static_url_path="")

# Reitti HTML-etusivulle
@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

# RESETTAA KAIKEN VARMAA MUUTETAAN MYO>HEMMI
@app.route('/reset', methods=['POST'])
def reset_game():
    conn = create_connection()
    if conn:
        cursor = conn.cursor()

        cursor.execute("UPDATE airport SET owner = 'Russia'")
        cursor.execute("UPDATE airport SET owner = 'Finland' WHERE ident = 'EFTP'")
        cursor.execute("UPDATE game SET location = 'EFTP', fuel = 250, war_points = 0 WHERE id = 1")

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Game reset to default state."})
    return jsonify({"success": False, "error": "Failed to reset game."}), 500


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

# Reitti karttaan
@app.route('/map')
def serve_map():
    return send_from_directory('../frontend/map', 'map.html')

# Lentokenttien haku
@app.route('/locations', methods=['GET'])
def get_locations():
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT ident, name, latitude_deg, longitude_deg, owner FROM airport"
        cursor.execute(query)
        locations = cursor.fetchall()
        cursor.close()
        conn.close()
        if locations:
            return jsonify(locations)
    return jsonify({"error": "No locations found"}), 404

# Hyökkäystoiminto ei viel  mitaa se on vaa press to bla bla
@app.route('/attack/<string:airport_ident>', methods=['POST'])
def attack_airport(airport_ident):
    conn = create_connection()
    if conn:
        cursor = conn.cursor()
        update_query = "UPDATE airport SET owner = 'Finland' WHERE ident = %s"
        cursor.execute(update_query, (airport_ident,))
        conn.commit()

     
        select_query = "SELECT name FROM airport WHERE ident = %s"
        cursor.execute(select_query, (airport_ident,))
        airport = cursor.fetchone()
        cursor.close()
        conn.close()

        if airport:
            return jsonify({"success": True, "airport_name": airport[0]})
    return jsonify({"success": False, "error": "Attack failed"}), 500

if __name__ == "__main__":
    app.run(debug=True)
