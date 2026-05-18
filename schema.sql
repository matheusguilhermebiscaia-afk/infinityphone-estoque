--
-- PostgreSQL database dump
--

\restrict 2agnqRAQkdOcNWgfz9HbLQZgIBYNIo3MIzXvfk9xKd4RsFiuGWvVuoMhJwqp8fN

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: config_lojas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_lojas (
    id integer NOT NULL,
    loja_numero integer NOT NULL,
    nome_loja text DEFAULT ''::text NOT NULL,
    endereco text DEFAULT ''::text NOT NULL,
    telefone text DEFAULT ''::text NOT NULL
);


--
-- Name: config_lojas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_lojas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_lojas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_lojas_id_seq OWNED BY public.config_lojas.id;


--
-- Name: estoque; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estoque (
    id integer NOT NULL,
    produto_id integer NOT NULL,
    loja_numero integer NOT NULL,
    quantidade integer DEFAULT 0 NOT NULL
);


--
-- Name: estoque_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estoque_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estoque_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estoque_id_seq OWNED BY public.estoque.id;


--
-- Name: movimentacoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimentacoes (
    id integer NOT NULL,
    produto_id integer NOT NULL,
    loja_numero integer NOT NULL,
    tipo text NOT NULL,
    quantidade integer NOT NULL,
    data timestamp with time zone DEFAULT now() NOT NULL,
    observacao text
);


--
-- Name: movimentacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.movimentacoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: movimentacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.movimentacoes_id_seq OWNED BY public.movimentacoes.id;


--
-- Name: produtos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produtos (
    id integer NOT NULL,
    modelo text NOT NULL,
    marca text NOT NULL,
    cor text NOT NULL,
    armazenamento_gb integer NOT NULL,
    ram_gb integer NOT NULL,
    preco_custo numeric(10,2) NOT NULL,
    preco_venda numeric(10,2) NOT NULL,
    status_novo_usado text DEFAULT 'novo'::text NOT NULL,
    data_cadastro timestamp with time zone DEFAULT now() NOT NULL,
    imagem_url text,
    imagem_file text
);


--
-- Name: produtos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produtos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.produtos_id_seq OWNED BY public.produtos.id;


--
-- Name: config_lojas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_lojas ALTER COLUMN id SET DEFAULT nextval('public.config_lojas_id_seq'::regclass);


--
-- Name: estoque id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque ALTER COLUMN id SET DEFAULT nextval('public.estoque_id_seq'::regclass);


--
-- Name: movimentacoes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes ALTER COLUMN id SET DEFAULT nextval('public.movimentacoes_id_seq'::regclass);


--
-- Name: produtos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos ALTER COLUMN id SET DEFAULT nextval('public.produtos_id_seq'::regclass);


--
-- Name: config_lojas config_lojas_loja_numero_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_lojas
    ADD CONSTRAINT config_lojas_loja_numero_unique UNIQUE (loja_numero);


--
-- Name: config_lojas config_lojas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_lojas
    ADD CONSTRAINT config_lojas_pkey PRIMARY KEY (id);


--
-- Name: estoque estoque_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque
    ADD CONSTRAINT estoque_pkey PRIMARY KEY (id);


--
-- Name: movimentacoes movimentacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_pkey PRIMARY KEY (id);


--
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);


--
-- Name: estoque estoque_produto_id_produtos_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque
    ADD CONSTRAINT estoque_produto_id_produtos_id_fk FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;


--
-- Name: movimentacoes movimentacoes_produto_id_produtos_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes
    ADD CONSTRAINT movimentacoes_produto_id_produtos_id_fk FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2agnqRAQkdOcNWgfz9HbLQZgIBYNIo3MIzXvfk9xKd4RsFiuGWvVuoMhJwqp8fN

