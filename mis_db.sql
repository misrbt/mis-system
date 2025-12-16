--
-- PostgreSQL database dump
--

\restrict 8bOSAVdHBZavsEiUWHhlZnBNQw06rGQwvcm0E64yC85IWunaEj3dnDa8LL5iXAg

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-16 10:32:40

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
-- TOC entry 243 (class 1259 OID 43151)
-- Name: asset_category; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.asset_category (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.asset_category OWNER TO super_admin;

--
-- TOC entry 242 (class 1259 OID 43150)
-- Name: asset_category_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.asset_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_category_id_seq OWNER TO super_admin;

--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 242
-- Name: asset_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.asset_category_id_seq OWNED BY public.asset_category.id;


--
-- TOC entry 249 (class 1259 OID 43218)
-- Name: assets; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.assets (
    id bigint NOT NULL,
    asset_name character varying(255) NOT NULL,
    asset_category_id bigint NOT NULL,
    brand character varying(255),
    model character varying(255),
    book_value double precision,
    serial_number character varying(255),
    purchase_date date,
    acq_cost double precision,
    waranty_expiration_date date,
    estimate_life integer,
    vendor_id bigint,
    status_id bigint NOT NULL,
    remarks text,
    assigned_to_employee_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.assets OWNER TO super_admin;

--
-- TOC entry 248 (class 1259 OID 43217)
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assets_id_seq OWNER TO super_admin;

--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 248
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- TOC entry 235 (class 1259 OID 43111)
-- Name: branch; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.branch (
    id bigint NOT NULL,
    branch_name character varying(255) NOT NULL,
    brak character varying(255) NOT NULL,
    brcode character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.branch OWNER TO super_admin;

--
-- TOC entry 234 (class 1259 OID 43110)
-- Name: branch_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.branch_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branch_id_seq OWNER TO super_admin;

--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 234
-- Name: branch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.branch_id_seq OWNED BY public.branch.id;


--
-- TOC entry 225 (class 1259 OID 43020)
-- Name: cache; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO super_admin;

--
-- TOC entry 226 (class 1259 OID 43030)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO super_admin;

--
-- TOC entry 245 (class 1259 OID 43160)
-- Name: employee; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.employee (
    id bigint NOT NULL,
    fullname character varying(255) NOT NULL,
    branch_id bigint NOT NULL,
    department_id bigint NOT NULL,
    position_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.employee OWNER TO super_admin;

--
-- TOC entry 244 (class 1259 OID 43159)
-- Name: employee_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_id_seq OWNER TO super_admin;

--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 244
-- Name: employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.employee_id_seq OWNED BY public.employee.id;


--
-- TOC entry 231 (class 1259 OID 43071)
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
-- TOC entry 230 (class 1259 OID 43070)
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
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 230
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 229 (class 1259 OID 43056)
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
-- TOC entry 228 (class 1259 OID 43041)
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
-- TOC entry 227 (class 1259 OID 43040)
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
-- TOC entry 5147 (class 0 OID 0)
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
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 219
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 223 (class 1259 OID 42999)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO super_admin;

--
-- TOC entry 233 (class 1259 OID 43090)
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
-- TOC entry 232 (class 1259 OID 43089)
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
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 232
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- TOC entry 237 (class 1259 OID 43124)
-- Name: position; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public."position" (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public."position" OWNER TO super_admin;

--
-- TOC entry 236 (class 1259 OID 43123)
-- Name: position_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.position_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.position_id_seq OWNER TO super_admin;

--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 236
-- Name: position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.position_id_seq OWNED BY public."position".id;


--
-- TOC entry 239 (class 1259 OID 43133)
-- Name: section; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.section (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.section OWNER TO super_admin;

--
-- TOC entry 238 (class 1259 OID 43132)
-- Name: section_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.section_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.section_id_seq OWNER TO super_admin;

--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 238
-- Name: section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.section_id_seq OWNED BY public.section.id;


--
-- TOC entry 224 (class 1259 OID 43008)
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
-- TOC entry 241 (class 1259 OID 43142)
-- Name: status; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.status (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.status OWNER TO super_admin;

--
-- TOC entry 240 (class 1259 OID 43141)
-- Name: status_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.status_id_seq OWNER TO super_admin;

--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 240
-- Name: status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.status_id_seq OWNED BY public.status.id;


--
-- TOC entry 222 (class 1259 OID 42985)
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
-- TOC entry 221 (class 1259 OID 42984)
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
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 247 (class 1259 OID 43205)
-- Name: vendors; Type: TABLE; Schema: public; Owner: super_admin
--

CREATE TABLE public.vendors (
    id bigint NOT NULL,
    company_name character varying(255) NOT NULL,
    contact_no character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.vendors OWNER TO super_admin;

--
-- TOC entry 246 (class 1259 OID 43204)
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: super_admin
--

CREATE SEQUENCE public.vendors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO super_admin;

--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 246
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: super_admin
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- TOC entry 4899 (class 2604 OID 43154)
-- Name: asset_category id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_category ALTER COLUMN id SET DEFAULT nextval('public.asset_category_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 43221)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 43114)
-- Name: branch id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.branch ALTER COLUMN id SET DEFAULT nextval('public.branch_id_seq'::regclass);


--
-- TOC entry 4900 (class 2604 OID 43163)
-- Name: employee id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee ALTER COLUMN id SET DEFAULT nextval('public.employee_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 43074)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 43044)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 42732)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 43093)
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 43127)
-- Name: position id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public."position" ALTER COLUMN id SET DEFAULT nextval('public.position_id_seq'::regclass);


--
-- TOC entry 4897 (class 2604 OID 43136)
-- Name: section id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.section ALTER COLUMN id SET DEFAULT nextval('public.section_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 43145)
-- Name: status id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.status ALTER COLUMN id SET DEFAULT nextval('public.status_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 42988)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 43208)
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- TOC entry 5130 (class 0 OID 43151)
-- Dependencies: 243
-- Data for Name: asset_category; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.asset_category (id, name, created_at, updated_at) FROM stdin;
1	Monitor	2025-12-12 07:52:12	2025-12-12 07:52:12
2	Desktop PC	2025-12-12 07:52:24	2025-12-12 07:52:24
3	UPS	2025-12-15 03:41:09	2025-12-15 03:41:09
4	Storage	2025-12-15 03:41:17	2025-12-15 03:41:17
\.


--
-- TOC entry 5136 (class 0 OID 43218)
-- Dependencies: 249
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.assets (id, asset_name, asset_category_id, brand, model, book_value, serial_number, purchase_date, acq_cost, waranty_expiration_date, estimate_life, vendor_id, status_id, remarks, assigned_to_employee_id, created_at, updated_at) FROM stdin;
1	ASUS gaming	2	Asus	dad2244	14998.3	44524455	2025-12-15	15000	2029-06-14	3	1	1	\N	1	2025-12-15 02:58:23	2025-12-15 05:06:10
2	UPS	3	APC	52245454	2496.58	452245544	2025-12-14	2500	2028-12-15	2	1	1	\N	1	2025-12-15 03:37:06	2025-12-15 06:41:16
4	OMNIA 24 inches	1	Omnia	23ds2e2e2	3900	12252442414	2025-07-23	4500	2026-03-18	3	2	1	\N	1	2025-12-16 01:22:57	2025-12-16 01:22:57
5	MSI 24'' Monitor	1	MSI	32d4323232	4446.14	21231231221	2024-10-16	5800	2026-11-19	5	1	1	\N	2	2025-12-16 02:00:07	2025-12-16 02:00:07
6	APC UPS 650 VA	3	APC	23d3d3ee	1757.99	1de233232311132	2024-06-19	3500	2026-02-16	3	2	1	\N	2	2025-12-16 02:07:41	2025-12-16 02:07:41
\.


--
-- TOC entry 5122 (class 0 OID 43111)
-- Dependencies: 235
-- Data for Name: branch; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.branch (id, branch_name, brak, brcode, created_at, updated_at) FROM stdin;
1	Head Office	HO	00	2025-12-12 07:08:06	2025-12-12 07:08:06
2	Main Office	MO	01	2025-12-12 07:08:16	2025-12-12 07:08:16
3	Jasaan Branch	JB	02	2025-12-12 07:10:01	2025-12-12 07:10:01
4	Salay Branch	SB	03	2025-12-12 07:10:15	2025-12-12 07:10:15
5	CDO Branch	CDOB	04	2025-12-12 07:11:17	2025-12-12 07:11:17
6	Maramag Branch	MB	05	2025-12-12 07:11:55	2025-12-12 07:11:55
7	Gingoog Branch Lite Unit	GNG-BLU	06	2025-12-12 07:12:41	2025-12-12 07:12:41
8	Camiguin Branch Lite Unit	CMG-BLU	07	2025-12-12 07:13:03	2025-12-12 07:13:03
9	Butuan Branch Lite Unit	BXU-BLU	08	2025-12-12 07:13:35	2025-12-12 07:13:35
10	Kibawe Branch Lite Unit	KIBAWE-BLU	09	2025-12-12 07:13:52	2025-12-12 07:13:52
11	Claveria Branch Lite Unit	Claveria-BLU	10	2025-12-12 07:14:16	2025-12-12 07:14:16
\.


--
-- TOC entry 5112 (class 0 OID 43020)
-- Dependencies: 225
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.cache (key, value, expiration) FROM stdin;
mis-cache-5c785c036466adea360111aa28563bfd556b5fba:timer	i:1765846827;	1765846827
mis-cache-5c785c036466adea360111aa28563bfd556b5fba	i:2;	1765846827
\.


--
-- TOC entry 5113 (class 0 OID 43030)
-- Dependencies: 226
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 5132 (class 0 OID 43160)
-- Dependencies: 245
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.employee (id, fullname, branch_id, department_id, position_id, created_at, updated_at) FROM stdin;
1	Augustin Maputol	1	1	1	2025-12-12 08:10:06	2025-12-12 08:10:06
2	Deserie Imy C. Quidet	1	1	2	2025-12-12 08:10:43	2025-12-12 08:10:43
3	Bryan Abelo	1	1	1	2025-12-15 05:31:51	2025-12-15 05:31:51
4	Pepito V. Vacalares	1	1	3	2025-12-15 05:32:17	2025-12-15 05:32:17
\.


--
-- TOC entry 5118 (class 0 OID 43071)
-- Dependencies: 231
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 5116 (class 0 OID 43056)
-- Dependencies: 229
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 5115 (class 0 OID 43041)
-- Dependencies: 228
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 5107 (class 0 OID 42729)
-- Dependencies: 220
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.migrations (id, migration, batch) FROM stdin;
14	0001_01_01_000000_create_users_table	1
15	0001_01_01_000001_create_cache_table	1
16	0001_01_01_000002_create_jobs_table	1
17	2025_12_10_043412_create_personal_access_tokens_table	1
18	2025_12_10_130000_add_username_to_users_table	1
19	2025_12_12_012033_create_branch	1
20	2025_12_12_012217_create_position	1
21	2025_12_12_012351_create_section	1
22	2025_12_12_013041_create_status	1
23	2025_12_12_013332_create_asset_category	1
24	2025_12_12_013600_create_employee	1
25	2025_12_12_012612_create_vendors	2
26	2025_12_12_013800_create_assets	2
\.


--
-- TOC entry 5110 (class 0 OID 42999)
-- Dependencies: 223
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- TOC entry 5120 (class 0 OID 43090)
-- Dependencies: 233
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
4	App\\Models\\User	1	auth_token	ec29e16550c4ccdbbe47e4b43836ba1e8591af8b9bc4bdd041bd807bfff6fd92	["*"]	2025-12-16 02:30:23	2025-12-23 00:59:40	2025-12-16 00:59:40	2025-12-16 02:30:23
\.


--
-- TOC entry 5124 (class 0 OID 43124)
-- Dependencies: 237
-- Data for Name: position; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public."position" (id, title, created_at, updated_at) FROM stdin;
1	MIS Assistant	2025-12-12 06:53:59	2025-12-12 06:53:59
2	MIS Supervisor	2025-12-12 06:54:14	2025-12-12 06:54:14
3	MIS Manager	2025-12-12 06:54:29	2025-12-12 06:54:29
4	Compliance Head	2025-12-12 06:54:55	2025-12-12 06:54:55
5	HR Manager	2025-12-12 06:55:13	2025-12-12 06:55:13
6	Business Development Officer	2025-12-12 06:55:33	2025-12-12 06:55:33
7	MFU Manager	2025-12-12 06:55:53	2025-12-12 06:55:53
8	MFU Assistant	2025-12-12 06:56:10	2025-12-12 06:56:10
9	Compliance Specialist	2025-12-12 06:56:28	2025-12-12 06:56:28
10	HR Associate	2025-12-12 06:56:52	2025-12-12 06:56:52
11	HR Supervisor	2025-12-12 06:57:08	2025-12-12 06:57:08
12	RAM Supervisor	2025-12-12 06:57:24	2025-12-12 06:57:24
13	Audit	2025-12-12 06:59:10	2025-12-12 06:59:10
14	Audit Manager	2025-12-12 06:59:20	2025-12-12 06:59:20
15	SME Account Assistant	2025-12-12 06:59:34	2025-12-12 06:59:34
16	Accounting Clerk	2025-12-12 06:59:46	2025-12-12 06:59:46
17	SME Account Officer	2025-12-12 06:59:58	2025-12-12 06:59:58
18	Branch Manager	2025-12-12 07:00:51	2025-12-12 07:00:51
19	Cashier	2025-12-12 07:00:59	2025-12-12 07:00:59
20	Teller	2025-12-12 07:01:06	2025-12-12 07:01:06
21	Customer Associate	2025-12-12 07:01:13	2025-12-12 07:01:13
22	General Bookkeeper	2025-12-12 07:01:26	2025-12-12 07:01:26
23	Loans Bookkeeper	2025-12-12 07:01:37	2025-12-12 07:01:37
24	Loan Processor	2025-12-12 07:01:49	2025-12-12 07:01:49
25	Account Officer	2025-12-12 07:01:59	2025-12-12 07:01:59
26	Loan Officer	2025-12-12 07:02:20	2025-12-12 07:02:20
27	Branch Lite Head	2025-12-12 07:02:38	2025-12-12 07:02:38
28	Office Associate	2025-12-12 07:02:51	2025-12-12 07:02:51
29	Loan Supervisor	2025-12-12 07:03:21	2025-12-12 07:03:21
30	MFU Loan Supervisor	2025-12-12 07:03:47	2025-12-12 07:03:47
\.


--
-- TOC entry 5126 (class 0 OID 43133)
-- Dependencies: 239
-- Data for Name: section; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.section (id, name, created_at, updated_at) FROM stdin;
1	MIS	2025-12-12 07:06:02	2025-12-12 07:06:02
2	Accounting	2025-12-12 07:06:11	2025-12-12 07:06:11
3	HR	2025-12-12 07:06:20	2025-12-12 07:06:20
4	Audit	2025-12-12 07:06:27	2025-12-12 07:06:27
5	Compliance	2025-12-12 07:06:45	2025-12-12 07:06:45
6	SME	2025-12-12 07:07:17	2025-12-12 07:07:17
7	Loans Section	2025-12-12 07:07:41	2025-12-12 07:07:41
8	Cash Section	2025-12-12 07:07:51	2025-12-12 07:07:51
\.


--
-- TOC entry 5111 (class 0 OID 43008)
-- Dependencies: 224
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- TOC entry 5128 (class 0 OID 43142)
-- Dependencies: 241
-- Data for Name: status; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.status (id, name, created_at, updated_at) FROM stdin;
1	New	2025-12-12 06:38:04	2025-12-12 06:38:04
2	Functional	2025-12-12 06:38:15	2025-12-12 06:38:15
3	Defective	2025-12-12 07:19:17	2025-12-12 07:19:17
4	Standby	2025-12-12 07:19:22	2025-12-12 07:19:28
5	Under Repair	2025-12-12 07:19:39	2025-12-12 07:19:39
\.


--
-- TOC entry 5109 (class 0 OID 42985)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, username) FROM stdin;
1	Augustin Maputol	cloudsephiroth56@gmail.com	\N	$2y$12$6V1e6kB3sHex0rjza7sLoub5U4QvxeNsDcE.atD/oOCS0tHCdjLKK	\N	2025-12-12 06:33:11	2025-12-12 06:33:11	maps
\.


--
-- TOC entry 5134 (class 0 OID 43205)
-- Dependencies: 247
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: super_admin
--

COPY public.vendors (id, company_name, contact_no, address, created_at, updated_at) FROM stdin;
1	Mastertech	09268361342	CDO	2025-12-12 06:33:26	2025-12-12 06:33:26
2	Gaisano Interpace	09268361344	CDO	2025-12-15 05:33:03	2025-12-15 05:33:03
\.


--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 242
-- Name: asset_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.asset_category_id_seq', 4, true);


--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 248
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.assets_id_seq', 6, true);


--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 234
-- Name: branch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.branch_id_seq', 11, true);


--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 244
-- Name: employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.employee_id_seq', 4, true);


--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 230
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 227
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 219
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.migrations_id_seq', 26, true);


--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 232
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 4, true);


--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 236
-- Name: position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.position_id_seq', 30, true);


--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 238
-- Name: section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.section_id_seq', 8, true);


--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 240
-- Name: status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.status_id_seq', 5, true);


--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 246
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: super_admin
--

SELECT pg_catalog.setval('public.vendors_id_seq', 2, true);


--
-- TOC entry 4945 (class 2606 OID 43158)
-- Name: asset_category asset_category_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.asset_category
    ADD CONSTRAINT asset_category_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 43229)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 43122)
-- Name: branch branch_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.branch
    ADD CONSTRAINT branch_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 2606 OID 43039)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 4918 (class 2606 OID 43029)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 4947 (class 2606 OID 43170)
-- Name: employee employee_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 43086)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4929 (class 2606 OID 43088)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 4925 (class 2606 OID 43069)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4922 (class 2606 OID 43054)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 42737)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 43007)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- TOC entry 4932 (class 2606 OID 43102)
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 43105)
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4939 (class 2606 OID 43131)
-- Name: position position_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public."position"
    ADD CONSTRAINT position_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 43140)
-- Name: section section_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 43017)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 43149)
-- Name: status status_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (id);


--
-- TOC entry 4906 (class 2606 OID 42998)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4908 (class 2606 OID 42996)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 43109)
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- TOC entry 4949 (class 2606 OID 43216)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 1259 OID 43055)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 4930 (class 1259 OID 43106)
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- TOC entry 4935 (class 1259 OID 43103)
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- TOC entry 4913 (class 1259 OID 43019)
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 4916 (class 1259 OID 43018)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: super_admin
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- TOC entry 4955 (class 2606 OID 43230)
-- Name: assets assets_asset_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_category_id_foreign FOREIGN KEY (asset_category_id) REFERENCES public.asset_category(id);


--
-- TOC entry 4956 (class 2606 OID 43245)
-- Name: assets assets_assigned_to_employee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_assigned_to_employee_id_foreign FOREIGN KEY (assigned_to_employee_id) REFERENCES public.employee(id);


--
-- TOC entry 4957 (class 2606 OID 43240)
-- Name: assets assets_status_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_status_id_foreign FOREIGN KEY (status_id) REFERENCES public.status(id);


--
-- TOC entry 4958 (class 2606 OID 43235)
-- Name: assets assets_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 4952 (class 2606 OID 43171)
-- Name: employee employee_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES public.branch(id);


--
-- TOC entry 4953 (class 2606 OID 43176)
-- Name: employee employee_department_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_department_id_foreign FOREIGN KEY (department_id) REFERENCES public.section(id);


--
-- TOC entry 4954 (class 2606 OID 43181)
-- Name: employee employee_position_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: super_admin
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_position_id_foreign FOREIGN KEY (position_id) REFERENCES public."position"(id);


-- Completed on 2025-12-16 10:32:40

--
-- PostgreSQL database dump complete
--

\unrestrict 8bOSAVdHBZavsEiUWHhlZnBNQw06rGQwvcm0E64yC85IWunaEj3dnDa8LL5iXAg

