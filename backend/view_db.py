import sqlite3

def print_table(cursor, table_name):
    print(f"\n{'='*50}")
    print(f" TABLE: {table_name.upper()}")
    print(f"{'='*50}")
    
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [info[1] for info in cursor.fetchall()]
    
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    
    if not rows:
        print("(Empty table)\n")
        return

    # Calculate column widths
    col_widths = [len(col) for col in columns]
    for row in rows:
        for i, val in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(val)))
            
    # Print headers
    header = " | ".join(str(col).ljust(width) for col, width in zip(columns, col_widths))
    print(header)
    print("-" * len(header))
    
    # Print rows
    for row in rows:
        print(" | ".join(str(val).ljust(width) for val, width in zip(row, col_widths)))
    print()

def main():
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    for table in tables:
        print_table(cursor, table[0])
    
    conn.close()

if __name__ == "__main__":
    main()
