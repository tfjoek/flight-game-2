from flask import Flask, jsonify, request, send_from_directory
from geopy.distance import geodesic
from database import create_connection

app = Flask(__name__, static_folder="../frontend", static_url_path="")

# Palauttaa etusivun HTML-tiedoston
@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

# Palauttaa pelin alkuperäiseen tilaan (reset)
@app.route('/reset', methods=['POST'])
def reset_game():
    conn = create_connection()
    if conn:
        cursor = conn.cursor()

        # Päivittää kaikki lentokentät Venäjän hallintaan, paitsi pelaajan aloitussijainnin
        cursor.execute("UPDATE airport SET owner = 'Russia'")
        cursor.execute("UPDATE airport SET owner = 'Finland' WHERE ident = 'EFTP'")

        # Palauttaa pelaajan sijainnin, polttoaineen ja sotapisteet oletusarvoihin
        cursor.execute("UPDATE game SET location = 'EFTP', fuel = 500, war_points = 0 WHERE id = 1")

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Game reset to default state."})
    return jsonify({"success": False, "error": "Failed to reset game."}), 500

# Palauttaa pelaajan tilan, mukaan lukien sijainti, polttoaine ja sotapisteet
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


# Palauttaa satunnaisen lentokentän tiedot
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

# Palauttaa karttasivun HTML-tiedoston
@app.route('/map')
def serve_map():
    return send_from_directory('../frontend/map', 'map.html')

# Palauttaa lentokenttien tiedot
@app.route('/locations', methods=['GET'])
def get_locations():
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT ident, name, latitude_deg, longitude_deg, owner, difficulty FROM airport"
        cursor.execute(query)
        locations = cursor.fetchall()
        cursor.close()
        conn.close()
        if locations:
            return jsonify(locations)
    return jsonify({"error": "No locations found"}), 404

# Palauttaa lentokenttien tiedot ja etäisyydet pelaajan sijainnista
@app.route('/locations_with_distances/<string:player_location>', methods=['GET'])
def get_locations_with_distances(player_location):
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT ident, name, latitude_deg, longitude_deg, owner, difficulty FROM airport"
        cursor.execute(query)
        locations = cursor.fetchall()

        # Hae pelaajan sijainnin koordinaatit
        player_query = "SELECT latitude_deg, longitude_deg FROM airport WHERE ident = %s"
        cursor.execute(player_query, (player_location,))
        player_coords = cursor.fetchone()

        if not player_coords:
            return jsonify({"error": "Player location not found"}), 404

        # Laskee etäisyyden pelaajan sijainnista kaikkiin lentokenttiin
        for location in locations:
            location_coords = (location["latitude_deg"], location["longitude_deg"])
            location["distance_km"] = geodesic(
                (player_coords["latitude_deg"], player_coords["longitude_deg"]),
                location_coords
            ).km

        cursor.close()
        conn.close()
        return jsonify(locations)
    return jsonify({"error": "No locations found"}), 404

# Suorittaa hyökkäyksen lentokenttään
@app.route('/attack/<string:destination_icao>', methods=['POST'])
def attack_airport(destination_icao):
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)

        # Pelaajan nykyinen sijainti ja polttoaine
        player_query = "SELECT location, fuel, war_points FROM game WHERE id = %s"
        cursor.execute(player_query, (1,))  # Pelaaja ID oletuksena 1
        player = cursor.fetchone()

        if not player:
            return jsonify({"success": False, "error": "Player not found"}), 404

        player_location = player['location']
        player_fuel = player['fuel']

        # Tarkista lentokentän omistaja
        owner_query = "SELECT owner FROM airport WHERE ident = %s"
        cursor.execute(owner_query, (destination_icao,))
        airport_owner = cursor.fetchone()

        if not airport_owner:
            return jsonify({"success": False, "error": "Target airport not found"}), 404

        if airport_owner['owner'] == 'Finland':
            # Jos lentokenttä on jo Suomen hallinnassa, estä hyökkäys
            return jsonify({"success": False, "error": "Lentokenttä on jo sinun hallinnassasi!"}), 400

        # Lentokenttien koordinaatit
        location_query = """
            SELECT ident, latitude_deg, longitude_deg 
            FROM airport WHERE ident IN (%s, %s)
        """
        cursor.execute(location_query, (player_location, destination_icao))
        airports = cursor.fetchall()

        if len(airports) != 2:
            return jsonify({"success": False, "error": "Invalid airport data"}), 400

        # Koordinaatit laskentaan
        coords = {airport['ident']: (airport['latitude_deg'], airport['longitude_deg']) for airport in airports}
        distance_km = geodesic(coords[player_location], coords[destination_icao]).km

        # Tarkista, riittääkö polttoaine
        if player_fuel < distance_km:
            return jsonify({"success": False, "error": "Not enough fuel"}), 400

        # Päivitä lentokentän omistaja ja pelaajan sijainti
        update_query = "UPDATE airport SET owner = 'Finland' WHERE ident = %s"
        cursor.execute(update_query, (destination_icao,))

        # Päivitä pelaajan sijainti, polttoaine ja lisää sotapisteitä
        update_player_query = """
            UPDATE game 
            SET location = %s, fuel = fuel - %s, war_points = war_points + 100
            WHERE id = %s
        """
        cursor.execute(update_player_query, (destination_icao, distance_km, 1))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Attacked and captured {destination_icao}",
            "fuel_used": round(distance_km, 2),
            "added_war_points": 100,
        }), 200

    return jsonify({"success": False, "error": "Database connection failed"}), 500

@app.route('/shop', methods=['GET'])
def shop_items():
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT name, description, effect, price FROM item"
        cursor.execute(query)
        items = cursor.fetchall()
        cursor.close()
        conn.close()

        if items:
            return jsonify(items)
    return jsonify({"error": "No items found"}), 404
 
@app.route('/buy_fuel', methods=['POST'])
def buy_fuel():
    data = request.get_json()
    fuel_amount = data.get('fuel_amount')

    if fuel_amount not in [50, 100]:
        return jsonify({"error": "Invalid fuel amount"}), 400

    cost = 25 if fuel_amount == 50 else 50

    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)

            cursor.execute("SELECT fuel, war_points FROM game WHERE id = 1")
            result = cursor.fetchone()

            if not result:
                return jsonify({"error": "Käyttäjä tietoa ei löydetty"}), 404

            current_fuel = result['fuel']
            current_war_points = result['war_points']

            if current_war_points < cost:
                return jsonify({"error": "Ei tarpeeksi sotapisteitä"}), 400

            new_fuel = current_fuel + fuel_amount
            new_war_points = current_war_points - cost

            cursor.execute(
                "UPDATE game SET fuel = %s, war_points = %s WHERE id = 1",
                (new_fuel, new_war_points)
            )
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({"message": f"Onnistuneesti ostettu {fuel_amount}km polttoainetta"}), 200

        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 500

        finally:
            conn.close()
    return jsonify({"error": "Database yhteys epäonnistui"}), 500

@app.route('/goodbye')
def byebye():
    return send_from_directory('../frontend', 'goodbye.html')

if __name__ == "__main__":
    app.run(debug=True)
