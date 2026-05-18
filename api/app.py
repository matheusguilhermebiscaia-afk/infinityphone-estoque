import os
import psycopg
from psycopg.rows import tuple_row
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL não configurada nas Environment Variables da Vercel")
    return psycopg.connect(DATABASE_URL, row_factory=tuple_row)

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

@app.before_request
def create_tables():
    # Vercel não tem before_first_request, usar before_request com flag
    if not hasattr(app, 'db_initialized'):
        init_db()
        app.db_initialized = True

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
