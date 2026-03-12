import sqlite3

def run_migration():
    print("Connecting to sql_app.db...")
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()

    print("Checking 'medicines' table columns...")
    cursor.execute("PRAGMA table_info(medicines)")
    columns = [info[1] for info in cursor.fetchall()]
    print(f"Current columns: {columns}")

    if 'inventory' not in columns:
        print("Adding 'inventory' column to 'medicines' table...")
        cursor.execute("ALTER TABLE medicines ADD COLUMN inventory INTEGER DEFAULT 0")
        print("Column 'inventory' added.")
    else:
        print("Column 'inventory' already exists.")

    if 'dependent_name' not in columns:
        print("Adding 'dependent_name' column to 'medicines' table...")
        cursor.execute("ALTER TABLE medicines ADD COLUMN dependent_name VARCHAR")
        print("Column 'dependent_name' added.")
    else:
        print("Column 'dependent_name' already exists.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    run_migration()
