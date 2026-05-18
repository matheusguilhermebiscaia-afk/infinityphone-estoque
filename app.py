import os
import psycopg2
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS produtos (
            id SERIAL PRIMARY KEY,
            modelo TEXT NOT NULL,
            imei TEXT,
            preco_compra REAL,
            preco_venda REAL,
            quantidade INTEGER DEFAULT 0,
            data_cadastro TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

@app.route('/')
def index():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM produtos ORDER BY id DESC")
    produtos = cur.fetchall()
    cur.close()
    conn.close()
    return render_template('index.html', produtos=produtos)

@app.route('/cadastrar', methods=['POST'])
def cadastrar():
    modelo = request.form['modelo']
    imei = request.form['imei']
    preco_compra = float(request.form['preco_compra'] or 0)
    preco_venda = float(request.form['preco_venda'] or 0)
    quantidade = int(request.form['quantidade'] or 0)

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO produtos (modelo, imei, preco_compra, preco_venda, quantidade)
        VALUES (%s,%s,%s,%s,%s)
    """, (modelo, imei, preco_compra, preco_venda, quantidade))
    conn.commit()
    cur.close()
    conn.close()
    return redirect(url_for('index'))

if __name__ == '__main__':
    init_db()
    app.run(debug=True)