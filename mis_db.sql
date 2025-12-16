--
-- PostgreSQL database dump
--

\restrict wtfkdCNgg1L3TD8nYN3roy0htLEHgZcMCqt4WGw2T0W8XTYKzh1QhvaFhm9wThh

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-11 10:45:35

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 225 (class 1259 OID 42774)
-- Name: cache; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO super_admin;

--
-- TOC entry 226 (class 1259 OID 42784)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO super_admin;

--
-- TOC entry 231 (class 1259 OID 42825)
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO super_admin;

--
-- TOC entry 230 (class 1259 OID 42824)
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO super_admin;

--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 230
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 229 (class 1259 OID 42810)
-- Name: job_batches; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO super_admin;

--
-- TOC entry 228 (class 1259 OID 42795)
-- Name: jobs; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO super_admin;

--
-- TOC entry 227 (class 1259 OID 42794)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO super_admin;

--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 227
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 220 (class 1259 OID 42729)
-- Name: migrations; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO super_admin;

--
-- TOC entry 219 (class 1259 OID 42728)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO super_admin;

--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 219
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 223 (class 1259 OID 42753)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO super_admin;

--
-- TOC entry 233 (class 1259 OID 42844)
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO super_admin;

--
-- TOC entry 232 (class 1259 OID 42843)
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO super_admin;

--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 232
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- TOC entry 224 (class 1259 OID 42762)
-- Name: sessions; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO super_admin;

--
-- TOC entry 222 (class 1259 OID 42739)
-- Name: users; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    username character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO super_admin;

--
-- TOC entry 221 (class 1259 OID 42738)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO super_admin;

--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4852 (class 2604 OID 42828)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 4851 (class 2604 OID 42798)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4849 (class 2604 OID 42732)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4854 (class 2604 OID 42847)
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- TOC entry 4850 (class 2604 OID 42742)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5041 (class 0 OID 42774)
-- Dependencies: 225
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.cache (key, value, expiration) FROM stdin;
mis-cache-5c785c036466adea360111aa28563bfd556b5fba:timer	i:1765420940;	1765420940
mis-cache-5c785c036466adea360111aa28563bfd556b5fba	i:1;	1765420940
\.


--
-- TOC entry 5042 (class 0 OID 42784)
-- Dependencies: 226
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 5047 (class 0 OID 42825)
-- Dependencies: 231
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 5045 (class 0 OID 42810)
-- Dependencies: 229
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 5044 (class 0 OID 42795)
-- Dependencies: 228
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 5036 (class 0 OID 42729)
-- Dependencies: 220
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_12_10_043412_create_personal_access_tokens_table	1
5	2025_12_10_130000_add_username_to_users_table	1
\.


--
-- TOC entry 5039 (class 0 OID 42753)
-- Dependencies: 223
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- TOC entry 5049 (class 0 OID 42844)
-- Dependencies: 233
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5040 (class 0 OID 42762)
-- Dependencies: 224
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
Zd9z5A46CldCeU47sTdHeZ9lOALbpLTUgiCr2UV3	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiR0pqMzZtaG9kcHVkOGlFMG5YV2xhMU5nN3NUZmc5RUh0M2pNU0NQcyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9fQ==	1765417610
d117LfErLnprQXx616bW6SzXHaLR6wtvO6IQsmez	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YToyOntzOjY6Il90b2tlbiI7czo0MDoiTE1KNG5vcmpyZWhGTGtjZkpuaXBKT3A1TUVFRkluZ1hIandsSnJlMiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1765417727
fNUed3V0Ui3Ejejd05RHqwLfopUn0w6gAmX6C3Mr	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YToyOntzOjY6Il90b2tlbiI7czo0MDoiNkg5elRJUnNtc29vM3QxZ3hBUklzTXZ5TVYyOU1QenZQamtWaWt6ZCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1765417731
avOohLknk7RuqPhaGz2iMioO0WUjize54TPU84hS	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YToyOntzOjY6Il90b2tlbiI7czo0MDoiTHR5aWRUcWV3c3VudXRRVHZUSnhHNHJJZVpvdU5rNzVEeTFoaUgxdiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1765417755
fpfIE6K8LQjWlLn13BDIY68lFyOx3m3Q0KWs8EPw	\N	127.0.0.1	curl/8.16.0	YToyOntzOjY6Il90b2tlbiI7czo0MDoiTVZZZVpERE14V1loRlJKQnhJMFBBMEgyWE0wS3RxZGw0bzlDeG4zQyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1765417864
\.


--
-- TOC entry 5038 (class 0 OID 42739)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, username) FROM stdin;
1	Augustin Maputol	cloudsephiroth56@gmail.com	\N	$2y$12$y/R8nKPaBZr8ntiYgKjEsOZyke2cQhKzFAv9HoAaXdGFatCUhD5Wq	\N	2025-12-10 05:58:40	2025-12-10 05:58:40	maps
\.


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 230
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 227
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 219
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 5, true);


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 232
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 5, true);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 4872 (class 2606 OID 42793)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 4870 (class 2606 OID 42783)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 4879 (class 2606 OID 42840)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 42842)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 4877 (class 2606 OID 42823)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4874 (class 2606 OID 42808)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4856 (class 2606 OID 42737)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4864 (class 2606 OID 42761)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- TOC entry 4884 (class 2606 OID 42856)
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 42859)
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4867 (class 2606 OID 42771)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 42752)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4860 (class 2606 OID 42750)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 42863)
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- TOC entry 4875 (class 1259 OID 42809)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 4882 (class 1259 OID 42860)
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- TOC entry 4887 (class 1259 OID 42857)
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- TOC entry 4865 (class 1259 OID 42773)
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 4868 (class 1259 OID 42772)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


-- Completed on 2025-12-11 10:45:36

--
-- PostgreSQL database dump complete
--

\unrestrict wtfkdCNgg1L3TD8nYN3roy0htLEHgZcMCqt4WGw2T0W8XTYKzh1QhvaFhm9wThh

