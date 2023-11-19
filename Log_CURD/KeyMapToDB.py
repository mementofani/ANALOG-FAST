import sqlite3
import re
import json


def extract_unique_words(message):
    words = re.findall(r'\b[a-zA-Z]{2,}\b', message)

    x = set()

    for i in words:
        try:
            x.add(i)
        except:
            continue

    return x


def create_word_logid_mapping(db_path='log_data.db'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Fetch all log messages
    cursor.execute('SELECT rowid, message FROM logs')
    logs = cursor.fetchall()

    word_logid_mapping = {}
    for log_id, message in logs:
        unique_words = extract_unique_words(message)
        for word in unique_words:
            if word in word_logid_mapping:
                word_logid_mapping[word].add(log_id)
            else:
                word_logid_mapping[word] = {log_id}

    conn.close()
    return word_logid_mapping


def save_mapping_to_database(data, db_path='log_data.db'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create table for word-logID mapping
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS word_logid_mapping (
            word TEXT PRIMARY KEY,
            log_ids TEXT
        )
    ''')

    # Insert or update the word-logID mapping
    for word, log_ids in data.items():
        json_log_ids = json.dumps(list(log_ids))
        cursor.execute('''
            INSERT INTO word_logid_mapping (word, log_ids) VALUES (?, ?)
            ON CONFLICT(word) DO UPDATE SET log_ids=excluded.log_ids
        ''', (word, json_log_ids))

    print(data.keys())

    conn.commit()
    conn.close()


# Run the function and save the dictionary to the existing database
word_logid_mapping = create_word_logid_mapping()
save_mapping_to_database(word_logid_mapping)

print(f"Word-logID mapping saved to the existing database 'log_data.db'")
