import psycopg2
conn = psycopg2.connect(host='db.kmqedasqmwsdbxjiccni.supabase.co', database='postgres', user='postgres', password='joe721122104025', port='5432')
cur = conn.cursor()

cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='orders' ORDER BY ordinal_position")
print("=== orders table columns ===")
for row in cur.fetchall():
    print(row)

cur.execute("SELECT * FROM orders LIMIT 5")
print("\n=== sample order rows ===")
for row in cur.fetchall():
    print(row)

cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='payments' ORDER BY ordinal_position")
print("\n=== payments table columns ===")
for row in cur.fetchall():
    print(row)

cur.close()
conn.close()
