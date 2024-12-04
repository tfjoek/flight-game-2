import mysql.connector

def create_connection():
    """Luo ja hallitsee tietokantayhteyden."""
    try:
        conn = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            database='flight_game',
            user='root',
            password='kappa',
            charset='utf8mb4',
            collation='utf8mb4_general_ci',
            autocommit=True
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Tietokantavirhe: {err}")
        return None
