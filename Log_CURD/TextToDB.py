import sqlite3
import re

# Regular expression pattern
log_pattern = re.compile(r'(\w+\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.*)')


def parse_log_line(line):
    match = log_pattern.match(line)
    if match:
        return match.groups()
    else:
        return None


def process_log_file(file_path, encoding='utf-8'):
    with open(file_path, 'r', encoding=encoding) as file:
        return [parse_log_line(line) for line in file if parse_log_line(line)]


def save_to_database(data, db_path='log_data.db'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create table
    cursor.execute('''CREATE TABLE IF NOT EXISTS logs
                      (time TEXT, layer_source TEXT, message TEXT)''')

    # Insert data
    cursor.executemany('INSERT INTO logs VALUES (?, ?, ?)', data)

    conn.commit()
    conn.close()


# Example usage
log_file_path = 'test_log2.out'
parsed_data = process_log_file(log_file_path)
save_to_database(parsed_data)
