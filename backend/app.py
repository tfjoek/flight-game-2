from flask import Flask, jsonify, request
from database import create_connection

app = Flask(__name__)

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

# Hyökkäystoiminto
@app.route('/attack', methods=['POST'])
def attack_airport():
    data = request.json
    player_id = data.get('player_id')
    destination_icao = data.get('destination_icao')

    # Lisää hyökkäyslogiikka tähän 
    return jsonify({"status": "attack logic not implemented yet"}), 501

# Kaupan avaaminen
@app.route('/shop/<int:player_id>', methods=['GET'])
def open_shop(player_id):
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT id, name, description, price FROM item ORDER BY RAND() LIMIT 2
        """
        cursor.execute(query)
        items = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(items)
    return jsonify({"error": "Unable to fetch shop items"}), 500

# Lentokenttien listaaminen
@app.route('/airports', methods=['GET'])
def list_airports():
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT ident, name, owner FROM airport ORDER BY name"
        cursor.execute(query)
        airports = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(airports)
    return jsonify({"error": "Unable to fetch airports"}), 500

if __name__ == '__main__':
    app.run(debug=True)
