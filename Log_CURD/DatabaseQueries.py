import sqlite3

db_file = r"C:\Users\hp\PycharmProjects\Analog\Log_CURD\log_data.db"


# Connect to the database
def connect_to_db():
    global db_file
    try:
        conn = sqlite3.connect(db_file)
        print("Connected to the SQLite database.")
        return conn
    except sqlite3.Error as err:
        print(err)
        return None


# Function to execute a single query
def execute_query(conn, sql):
    try:
        cursor = conn.cursor()
        cursor.execute(sql)
        results = cursor.fetchall()
        return results
    except sqlite3.Error as err:
        return {"error": str(err)}


# Main function to run a query
def query(sql):
    global db_file
    conn = connect_to_db()
    if conn is not None:
        results = execute_query(conn, sql)
        conn.close()
        return results
    else:
        return {"error": "Database connection failed"}
