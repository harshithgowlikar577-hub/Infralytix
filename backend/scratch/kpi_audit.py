import sqlite3
import os

paths = [
    r"C:\Users\harsh\OneDrive\Desktop\INFRALYTIX\infralytix.db",
    r"C:\Users\harsh\OneDrive\Desktop\INFRALYTIX\backend\infralytix.db"
]

for p in paths:
    if os.path.exists(p):
        print("=== Checking DB path:", p, f"({os.path.getsize(p)} bytes) ===")
        conn = sqlite3.connect(p)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall()]
        print("Tables:", tables)
        if 'projects' in tables:
            cursor.execute("SELECT COUNT(*) FROM projects")
            tot = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(DISTINCT id) FROM projects")
            dist_id = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(DISTINCT project_id) FROM projects")
            dist_pid = cursor.fetchone()[0]
            print(f"projects table: Total rows={tot}, Distinct UUIDs={dist_id}, Distinct project_ids={dist_pid}")
            
            cursor.execute("SELECT status, COUNT(*) FROM projects GROUP BY status")
            print("Status breakdown:", cursor.fetchall())
            
            cursor.execute("SELECT COUNT(*) FROM projects WHERE delay_days > 0")
            print("delay_days > 0:", cursor.fetchone()[0])
            
            cursor.execute("SELECT risk_category, COUNT(*) FROM projects GROUP BY risk_category")
            print("risk_category breakdown:", cursor.fetchall())

            cursor.execute("SELECT risk_level, COUNT(*) FROM projects GROUP BY risk_level")
            print("risk_level breakdown:", cursor.fetchall())

            cursor.execute("SELECT COUNT(*) FROM projects WHERE risk_score >= 70")
            print("risk_score >= 70:", cursor.fetchone()[0])

            cursor.execute("SELECT COUNT(*) FROM projects WHERE risk_score >= 60")
            print("risk_score >= 60:", cursor.fetchone()[0])

            cursor.execute("SELECT COUNT(DISTINCT state) FROM projects WHERE state IS NOT NULL AND state != ''")
            print("Distinct states:", cursor.fetchone()[0])
            
            # Sanctioned cost, revised cost, expenditure
            cursor.execute("SELECT SUM(original_cost), SUM(current_cost), SUM(expenditure) FROM projects")
            print("Financial sums (original_cost, current_cost, expenditure):", cursor.fetchall())
        conn.close()
